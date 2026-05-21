import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Package,
  Loader2,
  Upload,
  ImageIcon,
} from "lucide-react";
import { getConvexErrorMessage } from "../../lib/convexError";
import { toast } from "react-toastify";

const emptyForm = {
  name: "",
  price: "",
  category: "dresses",
  image: "",
  isNew: false,
  isBestseller: false,
  sizes: [],
  colors: [],
  description: "",
  material: "",
  care: "",
};

const categoryOptions = ["dresses", "tops", "sets", "accessories"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

export function AdminProducts() {
  const products = useQuery(api.products.list) || [];
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getImageUrl = useMutation(api.files.getImageUrl);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const userId = localStorage.getItem("userId");

  // Filtered products
  const filtered = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreate = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price),
      category: product.category,
      image: product.image,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
      sizes: product.sizes || [],
      colors: product.colors || [],
      description: product.description || "",
      material: product.material || "",
      care: product.care || "",
    });
    setImageFile(null);
    setImagePreview(product.image || null);
    setShowModal(true);
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    const imageUrl = await getImageUrl({ storageId });
    return imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    try {
      let imageUrl = formData.image;

      // Upload new image if one was selected
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImage(imageFile);
        setUploading(false);
      }

      if (!imageUrl && !editingProduct) {
        toast.error("Please upload a product image");
        setLoading(false);
        return;
      }

      const data = {
        userId,
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        image: imageUrl,
        isNew: formData.isNew,
        isBestseller: formData.isBestseller,
        sizes: formData.sizes,
        colors: formData.colors,
        description: formData.description || undefined,
        material: formData.material || undefined,
        care: formData.care || undefined,
      };

      if (editingProduct) {
        await updateProduct({ ...data, id: editingProduct._id });
        toast.success("Product updated successfully!");
      } else {
        await createProduct(data);
        toast.success("Product created successfully!");
      }

      setShowModal(false);
      setFormData(emptyForm);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error(getConvexErrorMessage(err, "Something went wrong"));
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!userId) return;
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await removeProduct({ userId, id: productId });
      toast.success("Product deleted");
    } catch (err) {
      toast.error(getConvexErrorMessage(err, "Failed to delete product"));
    }
  };

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleColorInput = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = e.target.value.trim();
      if (val && !formData.colors.includes(val)) {
        setFormData((prev) => ({ ...prev, colors: [...prev.colors, val] }));
        e.target.value = "";
      }
    }
  };

  const removeColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-stone-800 tracking-wide">
            Products
          </h1>
          <p className="text-sm text-stone-500 font-light mt-1">
            {products.length} total products
          </p>
        </div>
        <button
          onClick={openCreate}
          className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase rounded-lg hover:bg-stone-800 transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-amber-600 transition-colors"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto text-stone-300 mb-3" />
            <p className="text-sm text-stone-400 font-light">
              No products found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-stone-500 font-light">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-stone-500 font-light">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-stone-500 font-light">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-stone-500 font-light">
                    Tags
                  </th>
                  <th className="text-right py-3 px-4 text-xs tracking-widest uppercase text-stone-500 font-light">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded bg-stone-100 overflow-hidden shrink-0">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-stone-800 font-light truncate max-w-[120px] sm:max-w-[200px] block">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-stone-600 font-light">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-800 font-light">
                      ${product.price}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        {product.isNew && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] tracking-wide uppercase rounded-full">
                            New
                          </span>
                        )}
                        {product.isBestseller && (
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] tracking-wide uppercase rounded-full">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Create/Edit Modal ─── */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-[100vw] sm:w-[480px] bg-[#faf9f7] z-50 overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#faf9f7] border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-light text-stone-800 tracking-wide">
                {editingProduct ? "Edit Product" : "New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-stone-600 font-light mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-600 transition-colors bg-white"
                />
              </div>

              {/* Price + Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-stone-600 font-light mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, price: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-600 transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-stone-600 font-light mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-600 transition-colors bg-white"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-stone-600 font-light mb-1.5">
                  Product Image
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${
                    dragOver
                      ? "border-amber-500 bg-amber-50/50"
                      : "border-stone-300 hover:border-stone-400 bg-white"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    handleImageSelect(file);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e.target.files[0])}
                  />

                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs tracking-wide uppercase">
                          Click to change
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                          setFormData((p) => ({ ...p, image: "" }));
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-stone-500 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                        <ImageIcon size={20} className="text-stone-400" />
                      </div>
                      <p className="text-sm text-stone-600 font-light mb-1">
                        <span className="text-amber-600 font-medium">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-stone-400 font-light">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, isNew: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-stone-700 font-light">
                    Mark as New
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        isBestseller: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-stone-700 font-light">
                    Bestseller
                  </span>
                </label>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-stone-600 font-light mb-2">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 text-xs tracking-wide border rounded-lg transition-all ${
                        formData.sizes.includes(size)
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-stone-600 font-light mb-2">
                  Colors{" "}
                  <span className="text-stone-400 normal-case tracking-normal">
                    (press Enter to add)
                  </span>
                </label>
                <input
                  type="text"
                  onKeyDown={handleColorInput}
                  placeholder="Type a color and press Enter"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 transition-colors bg-white mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {formData.colors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-700 text-xs rounded-full"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-stone-400 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-stone-600 font-light mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-600 transition-colors bg-white resize-none"
                />
              </div>

              {/* Material */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-stone-600 font-light mb-1.5">
                  Material
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, material: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-600 transition-colors bg-white"
                />
              </div>

              {/* Care */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-stone-600 font-light mb-1.5">
                  Care Instructions
                </label>
                <input
                  type="text"
                  value={formData.care}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, care: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-600 transition-colors bg-white"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-stone-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 text-xs tracking-[0.15em] uppercase rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {editingProduct ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
