function DropUpload({ uploadCSV }) {

  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    uploadCSV(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-full flex items-center justify-center border-2 border-dashed text-slate-400"
    >
      Drop CSV file here
    </div>
  );
}

export default DropUpload;