
export const urlToBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
  // Use a proxy to avoid CORS issues, especially in development.
  // A simple proxy could be something like `https://cors-anywhere.herokuapp.com/`.
  // For this example, we'll try a direct fetch.
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image. Status: ${response.status} ${response.statusText}`);
  }
  const blob = await response.blob();
  const mimeType = blob.type;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader did not return a string.'));
      }
      // result is "data:mime/type;base64,..."
      const base64 = reader.result.split(',')[1];
      if (!base64) {
        return reject(new Error('Could not extract base64 string from data URL.'));
      }
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};
