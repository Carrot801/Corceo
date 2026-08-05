function DropUpload({
  handleDataFile,
  isUploadingFile = false,
}) {
  const handleDrop = async (event) => {
    event.preventDefault();

    if (isUploadingFile) {
      return;
    }

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (
      typeof handleDataFile !==
      "function"
    ) {
      console.error(
        "handleDataFile was not passed to DropUpload."
      );
      return;
    }

    try {
      await handleDataFile(file);
    } catch (error) {
      console.error(
        "File import failed:",
        error
      );
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(event) =>
        event.preventDefault()
      }
      className="
        flex
        h-full
        w-full
        items-center
        justify-center
        border-2
        border-dashed
        text-slate-400
      "
    >
      {isUploadingFile
        ? "Importing..."
        : "Drop CSV or Excel file here"}
    </div>
  );
}

export default DropUpload;