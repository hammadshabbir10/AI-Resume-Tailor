import React, { useState } from 'react';

interface FileReaderProps {
  onFileRead?: (file: File, dataUrl: string) => void;
}

const FileReader: React.FC<FileReaderProps> = ({ onFileRead }) => {
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed!');
      return;
    }
    setFileName(file.name);
    const reader = new window.FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      const dataUrl = ev.target?.result as string;
      setFileData(dataUrl);
      if (onFileRead) onFileRead(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!fileData) return;
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName || 'file.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-green-800">PDF File Reader</h2>
      <input
        type="file"
        accept="application/pdf"
        className="mb-4"
        onChange={handleFileChange}
      />
      {fileData && (
        <div className="mb-4">
          <div className="font-semibold mb-2">{fileName}</div>
          <embed src={fileData} type="application/pdf" className="w-full h-64 border rounded" />
          <button
            onClick={handleDownload}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
};

export default FileReader; 