import { createSignal } from 'solid-js';

export function UploadVideo() {
    const [videoUrl, setVideoUrl] = createSignal('');
    const [uploading, setUploading] = createSignal(false);
    const [error, setError] = createSignal('');

    const handleUpload = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);

        try {
            setUploading(true);
            setError('');
            // Replace with your upload URL
            const response = await fetch('YOUR_UPLOAD_URL', {
                body: formData,
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            setVideoUrl(result.url); // Adjust this according to your server's response
        } catch (err) {
            setError('Failed to upload video');
        } finally {
            setUploading(false);
        }
    };

    return (
      <div
        style="display: flex; flex-direction: column; align-items: center; padding: 16px; border: 1px solid #ccc; border-radius: 8px; width: 300px;">
          <input
            accept="video/*"
            onChange={handleUpload}
            style="margin-bottom: 16px;"
            type="file"
          />
          {uploading() && <p style="color: blue;">Uploading...</p>}
          {error() && <p style="color: red;">{error()}</p>}
          {videoUrl() && (
            <video controls src={videoUrl()} style="width: 100%; height: auto;"></video>
          )}
      </div>
    );
}
