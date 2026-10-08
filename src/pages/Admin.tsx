import { useEffect, useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NOTES } from "../data/products";

import { generateInvoicePDF } from "../lib/pdfGenerator";
import { Download, X, Pencil } from "lucide-react";
import heroBanner from "../imports/hero.png";
import categoryMen from "../imports/category-men.jpg";
import categoryWomen from "../imports/category-women.jpg";
import categoryUnisex from "../imports/category-unisex.jpg";
import categoryPerfumeRange from "../imports/category-perfume-range.jpg";
import categoryOilRange from "../imports/category-oil-range.jpg";

export function Admin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'invoices' | 'combos' | 'homepage'>('products');
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);

  // New Product State
  const [name, setName] = useState("");
  const [sizeOption, setSizeOption] = useState<"30ml" | "50ml" | "Both">("50ml");
  const [price30ml, setPrice30ml] = useState("");
  const [price50ml, setPrice50ml] = useState("");
  const [stock30ml, setStock30ml] = useState("");
  const [stock50ml, setStock50ml] = useState("");
  const [description, setDescription] = useState("");
  const [narrative, setNarrative] = useState("");
  const [composition, setComposition] = useState("");
  const [wearGuide, setWearGuide] = useState("");
  const [giftingDetails, setGiftingDetails] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [category, setCategory] = useState("Perfume");
  const [gender, setGender] = useState("Unisex");
  const [occasion, setOccasion] = useState("Any");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Offline Invoice State
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineName, setOfflineName] = useState("");
  const [offlinePhone, setOfflinePhone] = useState("");
  const [offlineAddress, setOfflineAddress] = useState("");
  const [offlineItems, setOfflineItems] = useState([{ productId: "", name: "", price: "", qty: "1" }]);

  // New Combo State
  const [comboName, setComboName] = useState("");
  const [comboDescription, setComboDescription] = useState("");
  const [comboImgUrl, setComboImgUrl] = useState("");
  const [comboItems, setComboItems] = useState<{ productId: string; size: string }[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/admin/login");
      } else {
        setUser(currentUser);
        fetchProducts();
        fetchOrders();
        fetchCombos();
        fetchHomepageSettings();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(items);
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  const fetchCombos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "combos"));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCombos(items);
    } catch (error) {
      console.error("Error fetching combos", error);
    }
  };

  const [homepageSettings, setHomepageSettings] = useState({
    heroBanner: "",
    categoryMen: "",
    categoryWomen: "",
    categoryUnisex: "",
    categoryPerfumeRange: "",
    categoryOilRange: "",
    promoBanner: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchHomepageSettings = async () => {
    try {
      const docRef = doc(db, "settings", "homepage");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHomepageSettings((prev) => ({ ...prev, ...docSnap.data() }));
      }
    } catch (error) {
      console.error("Error fetching homepage settings", error);
    }
  };

  const saveHomepageSettings = async () => {
    setSavingSettings(true);
    try {
      const docRef = doc(db, "settings", "homepage");
      await setDoc(docRef, homepageSettings, { merge: true });
      toast.success("Homepage settings saved!");
    } catch (error) {
      console.error("Error saving homepage settings", error);
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSettingsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("Uploading image...", { id: "upload" });
      const storageRef = ref(storage, `homepage/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setHomepageSettings(prev => ({ ...prev, [key]: url }));
      toast.success("Image uploaded", { id: "upload" });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Upload failed", { id: "upload" });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status", error);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error: any) {
      toast.error("Failed to delete product.");
      console.error(error);
    }
  };

  const handleDeleteCombo = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this combo?")) return;
    try {
      await deleteDoc(doc(db, "combos", id));
      toast.success("Combo deleted successfully!");
      fetchCombos();
    } catch (error: any) {
      toast.error("Failed to delete combo.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Compress to JPEG with 0.8 quality
          const base64Url = canvas.toDataURL("image/jpeg", 0.8);
          setImgUrl(base64Url);
          toast.success("Image processed and ready!");
          setUploading(false);
        };
      };
    } catch (err: any) {
      toast.error("Failed to process image.");
      console.error(err);
      setUploading(false);
    }
  };

  const toggleNote = (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(selectedNotes.filter(n => n !== note));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalSizes: string[] = [];
      let finalPrices: Record<string, number> = {};
      let finalSalePrices: Record<string, number> = {};
      let finalStock: Record<string, number> = {};

      if (sizeOption === "30ml" || sizeOption === "Both") {
        finalSizes.push("30ml");
        finalPrices["30ml"] = Number(price30ml);
        finalSalePrices["30ml"] = Number(price30ml);
        finalStock["30ml"] = Number(stock30ml);
      }
      if (sizeOption === "50ml" || sizeOption === "Both") {
        finalSizes.push("50ml");
        finalPrices["50ml"] = Number(price50ml);
        finalSalePrices["50ml"] = Number(price50ml);
        finalStock["50ml"] = Number(stock50ml);
      }

      const productData = {
        name,
        description,
        narrative,
        composition,
        wearGuide,
        giftingDetails,
        category,
        gender,
        occasion,
        sizes: finalSizes,
        prices: finalPrices,
        salePrices: finalSalePrices,
        stock: finalStock,
        notes: selectedNotes,
        img: imgUrl,
      };

      if (editingProductId) {
        await setDoc(doc(db, "products", String(editingProductId)), productData, { merge: true });
        toast.success("Product updated successfully!");
        setEditingProductId(null);
      } else {
        await addDoc(collection(db, "products"), { ...productData, createdAt: new Date().toISOString() });
        toast.success("Product added successfully!");
      }
      
      setName("");
      setPrice30ml("");
      setPrice50ml("");
      setStock30ml("");
      setStock50ml("");
      setSizeOption("50ml");
      setDescription("");
      setNarrative("");
      setComposition("");
      setWearGuide("");
      setGiftingDetails("");
      setImgUrl("");
      setSelectedNotes([]);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditProduct = (p: any) => {
    setEditingProductId(p.id);
    setName(p.name);
    if (p.sizes?.includes("30ml") && p.sizes?.includes("50ml")) {
      setSizeOption("Both");
      setPrice30ml(p.prices?.["30ml"] || p.price || "");
      setPrice50ml(p.prices?.["50ml"] || p.price || "");
      setStock30ml(p.stock?.["30ml"] ?? "");
      setStock50ml(p.stock?.["50ml"] ?? "");
    } else if (p.sizes?.includes("30ml")) {
      setSizeOption("30ml");
      setPrice30ml(p.prices?.["30ml"] || p.price || "");
      setPrice50ml("");
      setStock30ml(p.stock?.["30ml"] ?? "");
      setStock50ml("");
    } else {
      setSizeOption("50ml");
      setPrice30ml("");
      setPrice50ml(p.prices?.["50ml"] || p.price || "");
      setStock30ml("");
      setStock50ml(p.stock?.["50ml"] ?? "");
    }
    setDescription(p.description);
    setNarrative(p.narrative || "");
    setComposition(p.composition || "");
    setWearGuide(p.wearGuide || "");
    setGiftingDetails(p.giftingDetails || "");
    setImgUrl(p.img || "");
    setCategory(p.category || "Perfume");
    setGender(p.gender || "Unisex");
    setOccasion(p.occasion || "Any");
    setSelectedNotes(p.notes || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComboImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const base64Url = canvas.toDataURL("image/jpeg", 0.8);
          setComboImgUrl(base64Url);
          toast.success("Combo image processed and ready!");
          setUploading(false);
        };
      };
    } catch (err: any) {
      toast.error("Failed to process image.");
      setUploading(false);
    }
  };

  const handleAddCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comboItems.length === 0) {
      toast.error("Add at least one item to the combo");
      return;
    }
    try {
      const comboData = {
        name: comboName,
        description: comboDescription,
        items: comboItems,
        img: comboImgUrl,
      };

      if (editingComboId) {
        await setDoc(doc(db, "combos", String(editingComboId)), comboData, { merge: true });
        toast.success("Combo updated successfully!");
        setEditingComboId(null);
      } else {
        await addDoc(collection(db, "combos"), { ...comboData, createdAt: new Date().toISOString() });
        toast.success("Combo added successfully!");
      }
      
      setComboName("");
      setComboDescription("");
      setComboImgUrl("");
      setComboItems([]);
      fetchCombos();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditCombo = (c: any) => {
    setEditingComboId(c.id);
    setComboName(c.name);
    setComboDescription(c.description);
    setComboImgUrl(c.img || "");
    setComboItems(c.items || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Admin Dashboard</h1>
        <button onClick={handleLogout} className="text-gray-500 hover:text-black uppercase tracking-widest text-xs font-bold">Logout</button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-2 uppercase tracking-widest text-xs font-bold ${activeTab === 'products' ? 'border-b-2 border-[#800000] text-[#800000]' : 'text-gray-400 hover:text-gray-800'}`}
        >
          Manage Products
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-2 uppercase tracking-widest text-xs font-bold ${activeTab === 'orders' ? 'border-b-2 border-[#800000] text-[#800000]' : 'text-gray-400 hover:text-gray-800'}`}
        >
          Orders
        </button>
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-2 uppercase tracking-widest text-xs font-bold ${activeTab === 'invoices' ? 'border-b-2 border-[#800000] text-[#800000]' : 'text-gray-400 hover:text-gray-800'}`}
        >
          Invoices
        </button>
        <button 
          onClick={() => setActiveTab('combos')}
          className={`pb-3 px-2 uppercase tracking-widest text-xs font-bold ${activeTab === 'combos' ? 'border-b-2 border-[#800000] text-[#800000]' : 'text-gray-400 hover:text-gray-800'}`}
        >
          Combos
        </button>
        <button 
          onClick={() => setActiveTab('homepage')}
          className={`pb-3 px-2 uppercase tracking-widest text-xs font-bold ${activeTab === 'homepage' ? 'border-b-2 border-[#800000] text-[#800000]' : 'text-gray-400 hover:text-gray-800'}`}
        >
          Homepage
        </button>
      </div>

      {activeTab === 'homepage' ? (
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold mb-6">Homepage Settings</h2>
          <div className="bg-gray-50 p-6 border border-gray-100 rounded-xl space-y-8">
            
            {/* Field helper */}
            {Object.entries({
              heroBanner: { label: "Hero Banner (Top)", defaultImg: heroBanner },
              categoryMen: { label: "Category Grid: Men", defaultImg: categoryMen },
              categoryWomen: { label: "Category Grid: Women", defaultImg: categoryWomen },
              categoryUnisex: { label: "Category Grid: Unisex", defaultImg: categoryUnisex },
              categoryPerfumeRange: { label: "Range Grid: Shop Perfumes", defaultImg: categoryPerfumeRange },
              categoryOilRange: { label: "Range Grid: Shop Oils", defaultImg: categoryOilRange },
              promoBanner: { label: "Promo Banner (Concentrated Perfume Oils)", defaultImg: "https://images.unsplash.com/photo-1705936118918-870095881e61?w=1400&h=500&fit=crop&auto=format" }
            }).map(([key, { label, defaultImg }]) => (
              <div key={key}>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{label}</label>
                <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:bg-gray-100 transition relative">
                  <div className="relative inline-block w-full">
                    <img 
                      src={(homepageSettings as any)[key] || defaultImg} 
                      alt={label} 
                      className="mx-auto max-h-48 object-contain rounded" 
                    />
                    
                    {/* The remove button only shows if it's a custom image */}
                    {(homepageSettings as any)[key] && (
                      <button 
                        type="button" 
                        onClick={() => setHomepageSettings(prev => ({ ...prev, [key]: "" }))}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-md z-20"
                        title="Remove custom image and revert to default"
                      >
                        <X size={16} />
                      </button>
                    )}

                    {/* Invisible file input over the image */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors cursor-pointer rounded group">
                      <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white/90 p-3 rounded-full text-black shadow-lg">
                          <Pencil size={20} />
                        </div>
                        <span className="text-white font-bold tracking-widest uppercase text-xs drop-shadow-md">
                          Change Image
                        </span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleSettingsImageUpload(e, key)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Click to change image"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={saveHomepageSettings}
              disabled={savingSettings}
              className="w-full bg-[#800000] text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#600000] transition disabled:opacity-50"
            >
              {savingSettings ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : activeTab === 'products' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="col-span-1 bg-gray-50 p-6 border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold mb-6">{editingProductId ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleAddProduct} className="space-y-6">
            
            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Product Image</label>
              <div className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:bg-gray-100 transition relative">
                {imgUrl ? (
                  <div className="relative inline-block w-full">
                    <img src={imgUrl} alt="Preview" className="mx-auto h-32 object-contain rounded" />
                    <button 
                      type="button" 
                      onClick={() => setImgUrl("")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md z-20"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                    {/* Invisible file input over the image for direct changing */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors cursor-pointer rounded group">
                      <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white/90 p-2 rounded-full text-black shadow-lg">
                          <Pencil size={16} />
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                        title="Click to change image"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-gray-500 text-sm flex flex-col items-center justify-center h-full min-h-[8rem]">
                      {uploading ? "Uploading..." : "Click or drag to upload"}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Product Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border p-2" required />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Available Sizes</label>
                <select value={sizeOption} onChange={e => setSizeOption(e.target.value as any)} className="w-full border p-2">
                  <option value="50ml">50ml Only</option>
                  <option value="30ml">30ml Only</option>
                  <option value="Both">Both 30ml & 50ml</option>
                </select>
              </div>
              
              {(sizeOption === "30ml" || sizeOption === "Both") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Price for 30ml (Rs)</label>
                    <input type="number" value={price30ml} onChange={e => setPrice30ml(e.target.value)} className="w-full border p-2" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Stock for 30ml</label>
                    <input type="number" value={stock30ml} onChange={e => setStock30ml(e.target.value)} className="w-full border p-2" required />
                  </div>
                </div>
              )}
              
              {(sizeOption === "50ml" || sizeOption === "Both") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Price for 50ml (Rs)</label>
                    <input type="number" value={price50ml} onChange={e => setPrice50ml(e.target.value)} className="w-full border p-2" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Stock for 50ml</label>
                    <input type="number" value={stock50ml} onChange={e => setStock50ml(e.target.value)} className="w-full border p-2" required />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2">
                  <option value="Perfume">Perfume</option>
                  <option value="Oil">Oil</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full border p-2">
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Scent Notes</label>
              <div className="flex flex-wrap gap-2">
                {NOTES.map(note => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => toggleNote(note)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedNotes.includes(note) 
                        ? "bg-[#800000] text-white border-[#800000]" 
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description (Short)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 h-20" required />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Narrative</label>
              <textarea value={narrative} onChange={e => setNarrative(e.target.value)} className="w-full border p-2 h-20" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Composition</label>
              <textarea value={composition} onChange={e => setComposition(e.target.value)} className="w-full border p-2 h-20" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Wear Guide</label>
              <textarea value={wearGuide} onChange={e => setWearGuide(e.target.value)} className="w-full border p-2 h-20" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Gifting Details</label>
              <textarea value={giftingDetails} onChange={e => setGiftingDetails(e.target.value)} className="w-full border p-2 h-20" />
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={uploading || !imgUrl}
                className={`flex-1 text-white py-3 uppercase tracking-widest text-xs font-bold transition-colors ${
                  uploading || !imgUrl ? "bg-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#5a0000]"
                }`}
              >
                {uploading ? "Uploading..." : editingProductId ? "Update" : "Save"}
              </button>
              {editingProductId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(null);
                    setName("");
                    setPrice30ml("");
                    setPrice50ml("");
                    setSizeOption("50ml");
                    setDescription("");
                    setNarrative("");
                    setComposition("");
                    setWearGuide("");
                    setGiftingDetails("");
                    setImgUrl("");
                    setSelectedNotes([]);
                  }}
                  className="flex-1 border border-gray-300 py-3 uppercase tracking-widest text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-6">Your Products</h2>
          <div className="bg-white border border-gray-200">
            {products.length === 0 ? (
              <p className="p-6 text-gray-500">No products found. Add some above!</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Name</th>
                    <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Price</th>
                    <th className="p-4 text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium flex items-center gap-3">
                        {p.img && <img src={p.img} alt={p.name} className="w-8 h-10 object-cover rounded" />}
                        {p.name}
                      </td>
                      <td className="p-4">Rs. {p.prices?.["50ml"] || p.price}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleEditProduct(p)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-bold uppercase tracking-wider transition-colors mr-4"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      ) : activeTab === 'combos' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="col-span-1 bg-gray-50 p-6 border border-gray-100 h-fit">
            <h2 className="text-xl font-semibold mb-6">{editingComboId ? "Edit Combo" : "Create New Combo"}</h2>
            <form onSubmit={handleAddCombo} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Combo Image</label>
                <div className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:bg-gray-100 transition relative">
                  {comboImgUrl ? (
                    <div className="relative inline-block w-full">
                      <img src={comboImgUrl} alt="Preview" className="mx-auto h-32 object-contain rounded" />
                      <button 
                        type="button" 
                        onClick={() => setComboImgUrl("")}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md z-20"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                      {/* Invisible file input over the image for direct changing */}
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors cursor-pointer rounded group">
                        <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-white/90 p-2 rounded-full text-black shadow-lg">
                            <Pencil size={16} />
                          </div>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleComboImageUpload} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploading}
                          title="Click to change image"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-gray-500 text-sm flex flex-col items-center justify-center h-full min-h-[8rem]">
                        {uploading ? "Uploading..." : "Click or drag to upload"}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleComboImageUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Combo Name</label>
                <input type="text" value={comboName} onChange={e => setComboName(e.target.value)} className="w-full border p-2" required />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                <textarea value={comboDescription} onChange={e => setComboDescription(e.target.value)} className="w-full border p-2 h-24" required />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Combo Items</label>
                {comboItems.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select 
                      value={item.productId}
                      onChange={(e) => {
                        const newItems = [...comboItems];
                        newItems[index].productId = e.target.value;
                        setComboItems(newItems);
                      }}
                      className="flex-1 border p-2 text-xs"
                      required
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <select
                      value={item.size}
                      onChange={(e) => {
                        const newItems = [...comboItems];
                        newItems[index].size = e.target.value;
                        setComboItems(newItems);
                      }}
                      className="w-24 border p-2 text-xs"
                    >
                      <option value="8ml">8ml</option>
                      <option value="20ml">20ml</option>
                      <option value="50ml">50ml</option>
                    </select>
                    <button 
                      type="button"
                      onClick={() => {
                        const newItems = [...comboItems];
                        newItems.splice(index, 1);
                        setComboItems(newItems);
                      }}
                      className="text-red-500 px-2 font-bold"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={() => setComboItems([...comboItems, { productId: "", size: "50ml" }])}
                  className="text-xs font-bold text-[#800000] uppercase tracking-wider hover:underline"
                >
                  + Add Product
                </button>
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={uploading || !comboImgUrl}
                  className={`flex-1 text-white py-3 uppercase tracking-widest text-xs font-bold transition-colors ${
                    uploading || !comboImgUrl ? "bg-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#5a0000]"
                  }`}
                >
                  {uploading ? "Uploading..." : editingComboId ? "Update" : "Save"}
                </button>
                {editingComboId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingComboId(null);
                      setComboName("");
                      setComboDescription("");
                      setComboImgUrl("");
                      setComboItems([]);
                    }}
                    className="flex-1 border border-gray-300 py-3 uppercase tracking-widest text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Your Combos</h2>
            <div className="bg-white border border-gray-200">
              {combos.length === 0 ? (
                <p className="p-6 text-gray-500">No combos found. Create one above!</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Name</th>
                      <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Items</th>
                      <th className="p-4 text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combos.map(c => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium flex items-center gap-3">
                          {c.img && <img src={c.img} alt={c.name} className="w-8 h-10 object-cover rounded" />}
                          {c.name}
                        </td>
                        <td className="p-4 text-xs text-gray-600">
                          {c.items?.length || 0} products
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleEditCombo(c)}
                            className="text-blue-500 hover:text-blue-700 text-xs font-bold uppercase tracking-wider transition-colors mr-4"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCombo(c.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        <div>
          <h2 className="text-xl font-semibold mb-6">Recent Orders</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
            {orders.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No orders yet.</p>
            ) : (
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Order ID</th>
                    <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Customer</th>
                    <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Date</th>
                    <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Total</th>
                    <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Status</th>
                    <th className="p-4 text-xs uppercase tracking-wider text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-xs">{order.orderId || order.id}</td>
                      <td className="p-4 text-sm">
                        <div className="font-semibold">{order.shippingAddress?.name}</div>
                        <div className="text-gray-500 text-xs">{order.shippingAddress?.email}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{order.date}</td>
                      <td className="p-4 font-semibold text-[#800000]">Rs. {order.total?.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          order.status === 'Placed' || order.status === 'Processing' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'Packed' ? 'bg-blue-50 text-blue-800' :
                          order.status === 'Shipped' || order.status === 'In Transit' || order.status === 'Out' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          className="text-xs border border-gray-300 rounded p-1"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Out">Out</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : activeTab === 'invoices' ? (
        <div className="bg-white p-6 shadow-xs border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">All Invoices</h2>
            <button
              onClick={() => setShowOfflineModal(true)}
              className="bg-[#800000] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#5a0000] transition-colors"
            >
              + New Offline Invoice
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-4">Invoice # / Order ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  const invoiceNo = order.id.slice(-6).toUpperCase();
                  const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
                  
                  return (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="p-4 font-mono text-xs font-semibold text-gray-800">
                        MJZ-{invoiceNo}
                      </td>
                      <td className="p-4 text-xs">{date}</td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800 text-xs">{order.shippingAddress?.name || "Offline Customer"}</div>
                        <div className="text-[10px] text-gray-400">{order.shippingAddress?.email || ""}</div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800 text-xs">Rs. {order.total?.toLocaleString() || 0}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                          order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                          order.status === 'Shipped' || order.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Delivered' || order.status === 'Out for Delivery' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            generateInvoicePDF({
                              invoiceNo: `MJZ-${invoiceNo}`,
                              date: date,
                              dueDate: date,
                              customerName: order.shippingAddress?.name || "Offline Customer",
                              email: order.shippingAddress?.email || "N/A",
                              phone: order.shippingAddress?.phone || "N/A",
                              address: order.shippingAddress?.address || "Store Purchase",
                              items: order.cart?.map((c: any) => ({
                                name: c.name,
                                desc: c.size,
                                qty: c.quantity,
                                price: c.price,
                                amount: c.price * c.quantity
                              })) || [],
                              subtotal: order.total || 0,
                              tax: 0,
                              total: order.total || 0,
                              paymentDetails: `${order.paymentMethod || "Cash"} - Paid in full`,
                              message: "Thank you for shopping with Mijaz Luxury Perfumery.",
                              jobDesc: "Luxury Fragrance Purchase"
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-[#800000] hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <Download size={14} /> PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-10 text-center text-gray-500 text-sm">
                No invoices found.
              </div>
            )}
          </div>
          
          {/* Offline Invoice Modal */}
          {showOfflineModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Create Offline Invoice</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Name</label>
                      <input type="text" value={offlineName} onChange={(e) => setOfflineName(e.target.value)} className="w-full border p-2 rounded" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                      <input type="text" value={offlinePhone} onChange={(e) => setOfflinePhone(e.target.value)} className="w-full border p-2 rounded" placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                    <textarea value={offlineAddress} onChange={(e) => setOfflineAddress(e.target.value)} className="w-full border p-2 rounded" placeholder="Customer Address" rows={2}></textarea>
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Products</label>
                    {offlineItems.map((item, index) => (
                      <div key={index} className="flex gap-2 items-end mb-2">
                        <div className="flex-1">
                          <select 
                            value={item.productId} 
                            onChange={(e) => {
                              const pId = e.target.value;
                              const prod = products.find(p => p.id === pId);
                              const newItems = [...offlineItems];
                              newItems[index].productId = pId;
                              if (prod) {
                                newItems[index].name = prod.name;
                                const defaultPrice = prod.salePrices?.["50ml"] || prod.prices?.["50ml"] || prod.salePrices?.["8ml"] || prod.prices?.["8ml"] || prod.salePrices?.["20ml"] || prod.prices?.["20ml"] || prod.price || "";
                                newItems[index].price = defaultPrice.toString();
                              }
                              setOfflineItems(newItems);
                            }}
                            className="w-full border p-2 rounded text-sm"
                          >
                            <option value="">Select Product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <input type="number" placeholder="Price" value={item.price} onChange={(e) => {
                            const newItems = [...offlineItems];
                            newItems[index].price = e.target.value;
                            setOfflineItems(newItems);
                          }} className="w-full border p-2 rounded text-sm" />
                        </div>
                        <div className="w-20">
                          <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => {
                            const newItems = [...offlineItems];
                            newItems[index].qty = e.target.value;
                            setOfflineItems(newItems);
                          }} className="w-full border p-2 rounded text-sm" min="1" />
                        </div>
                        <button 
                          onClick={() => {
                            const newItems = [...offlineItems];
                            newItems.splice(index, 1);
                            setOfflineItems(newItems);
                          }}
                          className="bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200"
                        >
                          X
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => setOfflineItems([...offlineItems, { productId: "", name: "", price: "", qty: "1" }])}
                      className="text-xs font-bold text-[#800000] uppercase tracking-wider hover:underline mt-2"
                    >
                      + Add Another Product
                    </button>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t mt-4">
                    <button 
                      onClick={() => setShowOfflineModal(false)}
                      className="flex-1 py-2 text-gray-500 font-bold uppercase text-xs tracking-wider border rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        let total = 0;
                        const items = offlineItems.filter(i => i.name).map(i => {
                          const price = parseFloat(i.price) || 0;
                          const qty = parseInt(i.qty) || 1;
                          const amt = price * qty;
                          total += amt;
                          return {
                            name: i.name,
                            desc: "50ml",
                            qty: qty,
                            price: price,
                            amount: amt
                          };
                        });

                        if (items.length === 0) {
                          toast.error("Add at least one product");
                          return;
                        }
                        
                        const invoiceNoStr = `OFF-${Math.floor(Math.random() * 100000)}`;

                        // Save offline order to Firebase so it appears in the table
                        addDoc(collection(db, "orders"), {
                          createdAt: new Date().toISOString(),
                          shippingAddress: {
                            name: offlineName || "Walk-in Customer",
                            phone: offlinePhone || "N/A",
                            email: "N/A",
                            address: offlineAddress || "Store Purchase",
                            city: "Store",
                            state: "Store",
                            pincode: "000000",
                          },
                          cart: items.map(i => ({
                            name: i.name,
                            size: i.desc,
                            price: i.price,
                            quantity: i.qty
                          })),
                          subtotal: total,
                          total: total,
                          paymentMethod: "Cash",
                          status: "DELIVERED",
                          isOffline: true
                        }).then(() => {
                          fetchOrders(); // refresh table
                          toast.success("Offline invoice saved successfully!");
                        }).catch(e => {
                          console.error("Failed to save offline invoice:", e);
                          toast.error("Saved locally only, database error.");
                        });

                        generateInvoicePDF({
                          invoiceNo: invoiceNoStr,
                          date: new Date().toLocaleDateString('en-GB'),
                          dueDate: new Date().toLocaleDateString('en-GB'),
                          customerName: offlineName || "Walk-in Customer",
                          email: "N/A",
                          phone: offlinePhone || "N/A",
                          address: offlineAddress || "Store Purchase",
                          items: items,
                          subtotal: total,
                          tax: 0,
                          total: total,
                          paymentDetails: "Paid in store",
                          message: "Thank you for visiting Mijaz Luxury Perfumery.",
                          jobDesc: "Offline Purchase"
                        });
                        
                        setShowOfflineModal(false);
                      }}
                      className="flex-1 py-2 bg-[#800000] text-white font-bold uppercase text-xs tracking-wider rounded flex justify-center items-center gap-2 hover:bg-[#5a0000]"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
