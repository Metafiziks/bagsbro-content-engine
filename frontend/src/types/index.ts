export interface VideoCardProps {
  src: string;
  title: string;
  index: number;
  poster?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
}

export interface CreatorCreditProps {
  logoSrc: string;
  name: string;
}

export interface FestivalCardProps {
  icon: string;
  title: string;
  description: string;
}

export interface MarqueeVideoProps {
  videos: string[];
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

// Future wallet integration types
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
}

// Future backend API types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  uploadDate: string;
}

export interface FestivalSubmission {
  id: string;
  festivalName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'winner';
  submissionDate: string;
  category: string;
  award?: string;
}