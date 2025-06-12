import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, X, CheckCircle, Loader2, Eye } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { uploadPhotos } from '../store/testSlice';

interface PhotoUploadScreenProps {
  onPhotosUploaded: () => void;
}

const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({ onPhotosUploaded }) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const dispatch = useAppDispatch();
  const { uploadStatus, error } = useAppSelector((state) => state.test);
  const { toast } = useToast();

  const categories = [
    'Дом, дерево, человек',
    'Несуществующее животное', 
    'Автопортрет'
  ];

  useEffect(() => {
    if (uploadStatus === 'succeeded') {
      toast({
        title: "Фото успешно загружены",
        description: "Переходим к вопросам анкеты",
      });
      onPhotosUploaded();
    } else if (uploadStatus === 'failed' && error) {
      toast({
        title: "Ошибка загрузки",
        description: error,
        variant: "destructive",
      });
    }
  }, [uploadStatus, error, onPhotosUploaded, toast]);

  const handleFileSelect = useCallback((files: FileList | null, index?: number) => {
    if (!files) return;
    
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      setPhotos(prev => {
        const newPhotos = [...prev];
        if (index !== undefined) {
          newPhotos[index] = file;
        } else {
          const emptyIndex = newPhotos.findIndex(p => !p);
          if (emptyIndex !== -1) {
            newPhotos[emptyIndex] = file;
          } else if (newPhotos.length < 3) {
            newPhotos.push(file);
          }
        }
        return newPhotos;
      });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, index?: number) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files, index);
  }, [handleFileSelect]);

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (photos.length !== 3) return;
    dispatch(uploadPhotos(photos));
  };

  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const isComplete = photos.length === 3;
  const uploading = uploadStatus === 'loading';

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Загрузите фотографии рисунков
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Допустимые форматы файлов: jpg, jpeg, png, pdf. Размер не более 5 МБ
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold text-center text-gray-700">{category}</h3>
                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                    ${photos[index] 
                      ? 'border-green-500 bg-green-50' 
                      : dragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }
                  `}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {photos[index] ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img 
                          src={getImagePreview(photos[index])} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(getImagePreview(photos[index]), '_blank')}
                            className="mr-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-sm font-medium text-green-700 break-all">
                        {photos[index].name}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePhoto(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={uploading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600 mb-2">
                          Перетащите файл сюда или
                        </p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileSelect(e.target.files, index)}
                          className="hidden"
                          id={`file-input-${index}`}
                          disabled={uploading}
                        />
                        <label
                          htmlFor={`file-input-${index}`}
                          className={`inline-block px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                            uploading 
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          Выберите файл
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-6">
            <p className="text-sm text-gray-500 mb-4">
              Шаг 1/3 • Загружено {photos.length} из 3 файлов
            </p>
            <Button
              onClick={handleUpload}
              disabled={!isComplete || uploading}
              size="lg"
              className={`
                px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300
                ${isComplete && !uploading
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Загружаем...
                </>
              ) : (
                'Далее'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoUploadScreen;