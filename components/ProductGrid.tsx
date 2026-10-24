import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function ProductGrid() {
  return (
    <section id="grid" className="container-page py-16 sm:py-20">
      <div className="mb-10 flex flex-col gap-2 border-b-2 border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
          All Picks
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest2 text-muted">
          {products.length.toString().padStart(2, "0")} items — updated weekly
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
