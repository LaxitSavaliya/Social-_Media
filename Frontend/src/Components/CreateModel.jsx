import { ArrowLeft, ImageIcon, SquarePlay, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import useCreatePost from "../Hooks/useCreatePost";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const filters = {
  Normal: "none",
  Aden: "contrast(0.9) brightness(1.2) saturate(1.1) sepia(0.2)",
  Clarendon: "contrast(1.2) brightness(1.1) saturate(1.35)",
  Crema: "contrast(1.25) brightness(1.15) sepia(0.2)",
  Juno: "contrast(1.15) brightness(1.1) saturate(1.3)",
  Lark: "contrast(0.9) brightness(1.2) saturate(1.1)",
  Moon: "grayscale(1) contrast(1.1) brightness(1.1)",
  Gingham: "contrast(1.05) brightness(1.1) sepia(0.05)",
  Ludwig: "contrast(1.2) brightness(1.05) saturate(1.3)",
  Perpetua: "contrast(1.1) brightness(1.2) sepia(0.2)",
  Reyes: "contrast(0.85) brightness(1.1) saturate(0.75) sepia(0.22)",
  Slumber: "contrast(0.8) brightness(1.15) saturate(0.8) sepia(0.2)",
};

const CreateModel = ({ onClose }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [step, setStep] = useState("Crop");
  const [postData, setPostData] = useState({ files: null, content: "" });
  const [croppedFile, setCroppedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Normal");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const { isPending, createPostMutation } = useCreatePost();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(URL.createObjectURL(file));
  };

  const handleCropComplete = useCallback(
    (_, pixels) => setCroppedAreaPixels(pixels),
    []
  );

  const getCroppedImg = (imageSrc, pixelCrop) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = pixelCrop.width * scaleX;
        canvas.height = pixelCrop.height * scaleY;
        ctx.drawImage(
          image,
          pixelCrop.x * scaleX,
          pixelCrop.y * scaleY,
          pixelCrop.width * scaleX,
          pixelCrop.height * scaleY,
          0,
          0,
          pixelCrop.width * scaleX,
          pixelCrop.height * scaleY
        );
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas is empty"));
            resolve({ blob, croppedUrl: URL.createObjectURL(blob) });
          },
          "image/jpeg",
          1
        );
      };
      image.onerror = (err) => reject(err);
    });
  };

  const getFilteredImg = (imageUrl, filter) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageUrl;
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.filter = filter;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas is empty"));
            resolve({ blob, filteredUrl: URL.createObjectURL(blob) });
          },
          "image/jpeg",
          1
        );
      };
      image.onerror = (err) => reject(err);
    });
  };

  const handleNext = async () => {
    if (!croppedAreaPixels) return;
    try {
      const { croppedUrl } = await getCroppedImg(
        selectedFile,
        croppedAreaPixels
      );
      setCroppedFile(croppedUrl);
      setStep("Filter");
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = async () => {
    try {
      const { filteredUrl, blob } = await getFilteredImg(
        croppedFile,
        filters[selectedFilter]
      );
      setPreview(filteredUrl);
      setPostData({ ...postData, files: blob });
      setStep("Create New Post");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = () => {
    if (!postData.files) return toast.error("Add an image first");
    const formData = new FormData();
    formData.append("content", postData.content);
    formData.append("image", postData.files);
    createPostMutation(formData, {
      onSuccess: () => {
        toast.success("Post created successfully");
        onClose();
      },
      onError: (err) => toast.error(err.response?.data?.message || err.message),
    });
  };

  const handleBack = () => {
    if (step === "Create New Post") {
      setStep("Filter");
      setPostData({ ...postData, files: null, content: "" });
      setPreview(null);
    } else if (step === "Filter") {
      setStep("Crop");
      setCroppedFile(null);
      setSelectedFilter("Normal");
    } else setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <X
        className="absolute top-5 right-5 text-white h-8 w-8 cursor-pointer hover:text-gray-300 transition"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="w-11/12 max-w-5xl h-[85vh] bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {selectedFile ? (
          <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50">
            <ArrowLeft
              onClick={handleBack}
              className="cursor-pointer hover:text-gray-600"
              disabled={isPending}
            />
            <h3 className="text-lg font-semibold text-gray-800">{step}</h3>
            <button
              onClick={() => {
                step === "Crop"
                  ? handleNext()
                  : step === "Filter"
                  ? handleImageChange()
                  : handleSubmit();
              }}
              className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              disabled={isPending}
            >
              {step === "Create New Post"
                ? isPending
                  ? "Posting..."
                  : "Share"
                : "Next"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center border-b py-3 bg-gray-50">
            <h1 className="text-lg font-semibold text-gray-800">
              Create New Post
            </h1>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {!selectedFile ? (
              <motion.div
                key="drop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full w-full flex flex-col items-center justify-center gap-10"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex gap-5">
                  <ImageIcon className="h-32 w-32 text-gray-600 rotate-[-5deg]" />
                  <SquarePlay className="h-32 w-32 text-gray-600 rotate-[5deg]" />
                </div>
                <h1 className="text-xl font-medium text-gray-700 text-center">
                  Drag and drop photos or videos here
                </h1>
                <label
                  htmlFor="files"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
                >
                  Select from computer
                </label>
                <input
                  type="file"
                  id="files"
                  accept="image/*,video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </motion.div>
            ) : step === "Crop" ? (
              <motion.div
                key="crop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative h-full w-full bg-black"
              >
                <Cropper
                  image={selectedFile}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  cropShape="rect"
                  showGrid={false}
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10/12">
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="filter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative h-full w-full flex"
              >
                <div className="relative flex-[2] bg-black flex items-center justify-center">
                  <img
                    src={step === "Filter" ? croppedFile : preview}
                    alt="Cropped Preview"
                    className="h-full w-full object-contain rounded-bl-lg"
                    style={
                      step === "Filter"
                        ? { filter: filters[selectedFilter] }
                        : null
                    }
                  />
                </div>
                {step === "Filter" ? (
                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto p-3 pb-10 max-h-[calc(100vh-150px)] bg-gray-50 border-l">
                    {Object.keys(filters).map((name) => (
                      <button
                        key={name}
                        onClick={() => setSelectedFilter(name)}
                        className={`py-2 rounded-lg cursor-pointer border text-sm font-medium transition ${
                          selectedFilter === name
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-white hover:bg-gray-100 border-gray-300"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center p-4 bg-gray-50 border-l">
                    <label
                      htmlFor="content"
                      className="text-sm font-medium text-gray-600 mb-2"
                    >
                      Add Caption
                    </label>
                    <textarea
                      id="content"
                      className="flex-1 max-h-50 w-full p-2 rounded-md border resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={postData.content}
                      onChange={(e) =>
                        setPostData({ ...postData, content: e.target.value })
                      }
                      placeholder="Write something..."
                      disabled={isPending}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateModel;