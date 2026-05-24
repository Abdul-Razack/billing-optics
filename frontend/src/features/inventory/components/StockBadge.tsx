import { useInventoryStock } from '../hooks/useInventoryStock';

interface StockBadgeProps {
  productId: string;
}

export default function StockBadge({ productId }: StockBadgeProps): JSX.Element {
  const { data: stock, isLoading, error } = useInventoryStock(productId);

  if (isLoading) return <span>Loading stock...</span>;
  if (error || !stock) return <span>Error</span>;

  return (
    <span className="stock-badge">
      Available: {stock.availableQuantity}
    </span>
  );
}
