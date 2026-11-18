
import { useState } from 'react'
import { FolderKanban } from 'lucide-react'

interface ProjectCoverProps {
  coverImage?: string
  alt: string
  fallbackLabel: string
}

function ProjectCover({
  coverImage,
  alt,
  fallbackLabel,
}: ProjectCoverProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null)

  const imageSrc = coverImage?.trim() || undefined

  const shouldShowImage =
    imageSrc !== undefined && failedImage !== imageSrc

  return (
    <div className="relative h-52 overflow-hidden bg-linear-to-br from-brand-500/15 to-accent-cyan/5">
      {shouldShowImage ? (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          className="size-full object-cover transition duration-1000 ease-out group-hover:scale-105"
          onError={() => setFailedImage(imageSrc)}
        />
      ) : (
        <div className="grid size-full place-items-center">
          <div className="text-center">
            <FolderKanban
              size={38}
              className="mx-auto text-brand-300"
              aria-hidden="true"
            />

            <p className="mt-3 text-xs text-slate-500">
              {fallbackLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectCover
