import { createClient } from "@/lib/supabase/server";
import { CategoriesClient } from "./CategoriesClient";

export default async function CategoriesPage() {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-dark-text sm:text-3xl">
        Categories
      </h1>
      <CategoriesClient initialCategories={categories ?? []} />
    </div>
  );
}
