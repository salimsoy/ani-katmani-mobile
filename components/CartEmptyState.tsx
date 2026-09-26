import { ShoppingCart } from 'lucide-react-native';
import EmptyState from './EmptyState';

interface CartEmptyStateProps {
  onBrowse: () => void;
}

export default function CartEmptyState({ onBrowse }: CartEmptyStateProps) {
  return (
    <EmptyState
      icon={<ShoppingCart size={56} color="#ccc" />}
      title="Sepetiniz şu an boş"
      subtitle="Figürlerimize göz atın"
      buttonLabel="Alışverişe Başla"
      onButtonPress={onBrowse}
    />
  );
}