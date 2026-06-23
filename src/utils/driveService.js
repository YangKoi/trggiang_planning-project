/**
 * Google Drive Sync Service Helper
 * Using lightweight Fetch API direct calls to Google Drive API v3
 */

const FILE_NAME = 'nexus_pm_data.json';
const BOUNDARY = 'NEXUS_PM_MULTIPART_BOUNDARY';

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
    throw new Error('Không thể lấy thông tin tài khoản Google');
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
    throw new Error('Lỗi tìm kiếm file trên Google Drive');
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
    throw new Error('Lỗi tải dữ liệu từ Google Drive');
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
    throw new Error('Lỗi tạo tệp đồng bộ mới trên Google Drive');
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
    throw new Error('Lỗi ghi đè tệp đồng bộ trên Google Drive');
  }

  return await response.json();
}
