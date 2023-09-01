import {
  Hero,
  Feature,
  ProductSell,
  Pricing,
  VideoCarusel,
} from "./components";

export default function HomePage() {
  return (
    <main className="bg-[#FCF6F5]">
      <Hero />
      <Feature />
      <ProductSell />
      <Pricing />
      <VideoCarusel />
    </main>
  );
}
