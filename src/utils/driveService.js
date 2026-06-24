/**
 * Google Drive Sync Service Helper
 * Using lightweight Fetch API direct calls to Google Drive API v3
 */

const FILE_NAME = 'nexus_pm_data.json';
const BOUNDARY = 'NEXUS_PM_MULTIPART_BOUNDARY';

/**
 * Parses the error response from Google API to throw a descriptive user-friendly message
 */
async function handleErrorResponse(response, defaultMsg) {
  let detail = '';
  try {
    const errData = await response.json();
    detail = errData.error?.message || JSON.stringify(errData);
  } catch (e) {
    try {
      detail = await response.text();
    } catch (e2) {}
  }

  const detailLower = detail.toLowerCase();
  
  // Detect if Drive API is disabled on GCP project
  if (detailLower.includes('api has not been used') || detailLower.includes('disabled')) {
    return new Error(
      `${defaultMsg}: Dịch vụ Google Drive API chưa được kích hoạt. Vui lòng vào Google Cloud Console tìm "Google Drive API" và chọn ENABLE.`
    );
  }
  
  // Detect if user logged in but forgot to check the permission checkbox
  if (
    response.status === 403 || 
    detailLower.includes('permission') || 
    detailLower.includes('insufficient')
  ) {
    return new Error(
      `${defaultMsg}: Thiếu quyền truy cập Drive. Vui lòng Đăng xuất và Kết nối lại, nhớ TÍCH CHỌN ô cho phép ứng dụng truy cập tệp Google Drive.`
    );
  }

  return new Error(`${defaultMsg} (${response.status}): ${detail || response.statusText}`);
}

/**
 * Fetch Google User Profile info using Access Token
 */
export async function fetchUserProfile(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw await handleErrorResponse(response, 'Không thể lấy thông tin tài khoản Google');
  }

  return await response.json();
}

/**
 * Find the nexus_pm_data.json file in the user's Drive
 * Returns the file object { id, name, modifiedTime } or null
 */
export async function findDataFile(accessToken) {
  const query = encodeURIComponent(`name = '${FILE_NAME}' and trashed = false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw await handleErrorResponse(response, 'Lỗi tìm kiếm file trên Google Drive');
  }

  const result = await response.json();
  if (result.files && result.files.length > 0) {
    return result.files[0];
  }
  return null;
}

/**
 * Download the content of a file by fileId
 */
export async function downloadDataFile(accessToken, fileId) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw await handleErrorResponse(response, 'Lỗi tải dữ liệu từ Google Drive');
  }

  return await response.json();
}

/**
 * Create a new file on Google Drive using Multipart upload
 */
export async function createDataFile(accessToken, data) {
  const metadata = {
    name: FILE_NAME,
    mimeType: 'application/json'
  };

  const delimiter = `\r\n--${BOUNDARY}\r\n`;
  const closeDelim = `\r\n--${BOUNDARY}--`;

  const body = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(data) +
    closeDelim;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${BOUNDARY}`
      },
      body: body
    }
  );

  if (!response.ok) {
    throw await handleErrorResponse(response, 'Lỗi tạo tệp đồng bộ mới trên Google Drive');
  }

  return await response.json();
}

/**
 * Update the content of an existing file on Google Drive
 */
export async function updateDataFile(accessToken, fileId, data) {
  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    throw await handleErrorResponse(response, 'Lỗi ghi đè tệp đồng bộ trên Google Drive');
  }

  return await response.json();
}
