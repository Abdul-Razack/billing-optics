// Barcode generation or scanner helper utility
export const generateSKU = (brand: string, model: string, category: string) => {
  const cleanBrand = brand.slice(0, 3).toUpperCase();
  const cleanModel = model.slice(0, 3).toUpperCase();
  const cleanCat = category.slice(0, 2).toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanCat}-${cleanBrand}-${cleanModel}-${randNum}`;
};
export default generateSKU;
