export const resizeAndCompressImage = (file: File, maxSize = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("이미지를 읽을 수 없습니다."));
      }

      const img = new Image();
      img.src = event.target.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error("캔버스 컨텍스트를 가져올 수 없습니다."));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = (error) => {
        reject(error);
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
}; 