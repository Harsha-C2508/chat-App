import React, { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { resolveFileUrl, formatBytes, getDownloadUrl } from '../../../config/fileUtils';

const isVideoFile = (fileType, fileName) =>
  fileType?.startsWith('video/') ||
  /\.(webm|mp4|mov|avi|mkv|m4v)$/i.test(fileName || '');

const isImageFile = (fileType, fileName) =>
  fileType?.startsWith('image/') ||
  (!isVideoFile(fileType, fileName) && /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(fileName || ''));

const isAudioFile = (fileType, fileName) =>
  fileType?.startsWith('audio/') ||
  /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(fileName || '');

const MediaViewerModal = ({ message, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  if (!message?.fileUrl) return null;

  const src = resolveFileUrl(message.fileUrl);
  const { fileName, fileType, fileSize } = message;
  const isVideo = isVideoFile(fileType, fileName);
  const isImage = isImageFile(fileType, fileName);
  const isAudio = isAudioFile(fileType, fileName);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const downloadUrl = getDownloadUrl(message.fileUrl, fileName || 'download');
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      notifications.show({
        title: 'Download failed',
        message: 'Could not download this file. Please try again.',
        color: 'red',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: '900px',
          backgroundColor: '#1e1e2e',
          borderRadius: '16px',
          border: '1px solid #2e2e42',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid #2e2e42', backgroundColor: '#252535',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ color: '#f0f0f5', fontSize: '14px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName || 'Shared file'}
            </p>
            {fileSize ? (
              <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>{formatBytes(fileSize)}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', marginLeft: '12px', flexShrink: 0 }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {isVideo && (
            <video
              key={src}
              src={src}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', maxHeight: '70vh', borderRadius: '12px', backgroundColor: '#000' }}
            />
          )}

          {isImage && (
            <img
              src={src}
              alt={fileName}
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', objectFit: 'contain' }}
            />
          )}

          {isAudio && (
            <audio key={src} src={src} controls autoPlay style={{ width: '100%' }} />
          )}

          {!isVideo && !isImage && !isAudio && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 16px' }}>
                Preview not available for this file type.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            style={{
              background: 'none',
              border: 'none',
              color: '#5b7cf6',
              fontSize: '13px',
              fontWeight: 500,
              cursor: downloading ? 'wait' : 'pointer',
              opacity: downloading ? 0.6 : 1,
            }}
          >
            {downloading ? 'Downloading…' : 'Download file'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaViewerModal;
