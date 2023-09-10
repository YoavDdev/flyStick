import {
  Hero,
  Feature,
  Pricing,
  VideoCarusel,
  Quiz,
  ProductSell,
} from "./components";

export default function HomePage() {
  return (
    <main className="bg-[#FCF6F5]">
      <Hero />
      <Feature />
      <Quiz />
      <Pricing />
      <ProductSell />
      {/* <VideoCarusel /> */}
    </main>
  );
}
