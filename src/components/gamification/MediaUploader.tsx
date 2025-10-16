"use client";
import { useRef, useState } from 'react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

export function MediaUploader({ onUploaded, maxFiles = 3 }: { onUploaded: (urls: string[]) => void, maxFiles?: number }) {
  const inputRef = useRef<HTMLInputElement|null>(null);
  const [progress, setProgress] = useState<number>(0);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxFiles);
    const urls: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
      if (file.size > 20 * 1024 * 1024) continue; // 20MB cap
      const objectRef = ref(storage, `media/${Date.now()}-${file.name}`);
      const task = uploadBytesResumable(objectRef, file);
      await new Promise<void>((resolve, reject) => {
        task.on('state_changed', snap => {
          setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        }, reject, async () => {
          const url = await getDownloadURL(objectRef);
          urls.push(url);
          resolve();
        });
      });
    }
    onUploaded(urls);
    if (inputRef.current) inputRef.current.value = '';
    setProgress(0);
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" multiple accept="image/*,video/*" onChange={onChange} />
      {progress > 0 && <div className="text-sm text-muted-foreground">Upload: {progress}%</div>}
    </div>
  );
}
