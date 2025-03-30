import React, { useState, useCallback, useRef, useEffect } from 'react';

interface DropzoneProps {
    handleAttachments: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({handleAttachments}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  useEffect(()=>{
    handleAttachments(files)
  },[files])

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="file-drop"
    >
      <p style={{ marginBottom: files.length ? '16px' : '0' }}>
        Click or drag and drop your files here
      </p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {files.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {files.map((file, index) => (
            <div
              key={index}
              style={{
                width: '100px',
                height: '130px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  wordBreak: 'break-word',
                  maxHeight: '40px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {file.name}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#888',
                  marginTop: '6px',
                  wordBreak: 'break-word',
                }}
              >
                {formatFileSize(file.size)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropzone;
