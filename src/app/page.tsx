import {
  Hero,
  Feature,
  Pricing,
  VideoCarusel,
  Quiz,
  ProductSell,
  User,
} from "./components";

export default function HomePage() {
  return (
    <main className="bg-[#FCF6F5]">
      <Hero />
      <Feature />
      <VideoCarusel />
      {/* <Quiz /> */}
      {/* <ProductSell /> */}
      <Pricing />
      {/* <User /> */}
    </main>
  );
}
