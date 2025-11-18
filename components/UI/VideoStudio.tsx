import React, { useState, useRef } from 'react';
import { generateVeoVideo } from '../../services/gemini';

interface VideoStudioProps {
  onClose: () => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      setFile(e.currentTarget.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file || !prompt) return;
    setLoading(true);
    setError('');
    setStatus('Initializing Veo...');
    
    try {
      setStatus('Uploading & Generating (This may take a minute)...');
      const url = await generateVeoVideo(file, prompt, '16:9');
      setVideoUrl(url);
      setStatus('Done!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center z-50 overflow-y-auto py-10">
      <div className="w-full max-w-2xl p-8 bg-black rounded-2xl border border-gray-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Veo Motion Studio
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
        </div>

        {!videoUrl ? (
            <>
                <div className="mb-6">
                    <label className="block text-gray-400 mb-2">1. Upload Character/Screenshot</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="w-full p-2 bg-gray-900 rounded border border-gray-700 text-white"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-400 mb-2">2. Describe the Animation</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.currentTarget.value)}
                        placeholder="e.g., A cinematic pan of the character preparing for battle, explosion in background, 4k..."
                        className="w-full h-24 bg-gray-900 text-white p-4 rounded border border-gray-700 focus:border-purple-500 outline-none"
                    />
                </div>

                {error && <div className="p-4 mb-4 bg-red-900/30 text-red-400 rounded">{error}</div>}
                {loading && <div className="p-4 mb-4 bg-blue-900/30 text-blue-400 rounded animate-pulse">{status}</div>}

                <button 
                    onClick={handleGenerate}
                    disabled={loading || !file || !prompt}
                    className={`w-full py-4 rounded font-bold text-lg uppercase tracking-wider
                        ${loading ? 'bg-gray-700 cursor-wait' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'}
                    `}
                >
                    {loading ? 'Processing...' : 'Generate Video'}
                </button>
            </>
        ) : (
            <div className="flex flex-col items-center">
                <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-lg mb-6 border border-gray-700" />
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => setVideoUrl(null)} 
                        className="flex-1 py-3 bg-gray-800 rounded hover:bg-gray-700"
                    >
                        Create Another
                    </button>
                    <a 
                        href={videoUrl} 
                        download="veo-creation.mp4"
                        className="flex-1 py-3 bg-green-600 rounded hover:bg-green-500 text-center font-bold"
                    >
                        Download
                    </a>
                </div>
            </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-gray-500">
            Powered by Google Veo. Video generation requires a supported region and API key.
            <br />
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-gray-300">Billing Information</a>
        </div>
      </div>
    </div>
  );
};