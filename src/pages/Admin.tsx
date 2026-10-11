import { useEffect, useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query, getDoc, setDoc, runTransaction } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NOTES } from "../data/products";

import { generateInvoicePDF } from "../lib/pdfGenerator";
import { Download, X, Pencil, Tag, Percent, Plus, Check, Trash2, Power, Star, UploadCloud, Megaphone, ArrowUp, ArrowDown } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { Coupon } from "../types";
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'invoices' | 'combos' | 'coupons' | 'homepage' | 'settings'>('products');
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percentage" | "fixed">("percentage");
  const [couponValue, setCouponValue] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("");
  const [couponMaxDiscount, setCouponMaxDiscount] = useState("");
  const [couponDescription, setCouponDescription] = useState("");
  const [couponIsActive, setCouponIsActive] = useState(true);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [savingCoupon, setSavingCoupon] = useState(false);

  // New Product State
  const [name, setName] = useState("");
  const [sizeOption, setSizeOption] = useState<"30ml" | "50ml" | "Both">("50ml");
  const [price30ml, setPrice30ml] = useState("");
  const [mrp30ml, setMrp30ml] = useState("");
  const [price50ml, setPrice50ml] = useState("");
  const [mrp50ml, setMrp50ml] = useState("");
  const [stock30ml, setStock30ml] = useState("");
  const [stock50ml, setStock50ml] = useState("");
  const [description, setDescription] = useState("");
  const [narrative, setNarrative] = useState("");
  const [wearGuide, setWearGuide] = useState("");
  const [giftingDetails, setGiftingDetails] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [imgUrls, setImgUrls] = useState<string[]>([]);
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
  const [offlineState, setOfflineState] = useState("Delhi");
  const [offlinePincode, setOfflinePincode] = useState("");
  const [offlineItems, setOfflineItems] = useState([{ productId: "", name: "", price: "", qty: "1" }]);

  // New Combo State
  const [comboName, setComboName] = useState("");
  const [comboDescription, setComboDescription] = useState("");
  const [comboImgUrl, setComboImgUrl] = useState("");
  const [comboItems, setComboItems] = useState<{ productId: string; size: string }[]>([]);
  const [comboDiscount, setComboDiscount] = useState<number>(0);

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
        fetchCoupons();
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

  const fetchCoupons = async () => {
    try {
      const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Coupon[];
      setCoupons(items);
    } catch (error) {
      console.error("Error fetching coupons", error);
      try {
        const querySnapshot = await getDocs(collection(db, "coupons"));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Coupon[];
        setCoupons(items);
      } catch (err) {
        console.error("Error fetching coupons fallback", err);
      }
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    const val = Number(couponValue);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid discount amount");
      return;
    }
    if (couponType === "percentage" && val > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    setSavingCoupon(true);
    try {
      const payload: Partial<Coupon> = {
        code: cleanCode,
        type: couponType,
        value: val,
        minOrder: couponMinOrder ? Number(couponMinOrder) : 0,
        maxDiscount: couponMaxDiscount ? Number(couponMaxDiscount) : 0,
        description: couponDescription.trim(),
        isActive: couponIsActive,
      };

      if (editingCouponId) {
        await updateDoc(doc(db, "coupons", editingCouponId), payload);
        toast.success(`Coupon ${cleanCode} updated successfully`);
      } else {
        await addDoc(collection(db, "coupons"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success(`Coupon ${cleanCode} created successfully`);
      }

      // Reset form
      setCouponCode("");
      setCouponType("percentage");
      setCouponValue("");
      setCouponMinOrder("");
      setCouponMaxDiscount("");
      setCouponDescription("");
      setCouponIsActive(true);
      setEditingCouponId(null);
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon", error);
      toast.error("Failed to save coupon");
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleEditCoupon = (c: Coupon) => {
    setEditingCouponId(c.id || null);
    setCouponCode(c.code);
    setCouponType(c.type);
    setCouponValue(String(c.value));
    setCouponMinOrder(c.minOrder ? String(c.minOrder) : "");
    setCouponMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : "");
    setCouponDescription(c.description || "");
    setCouponIsActive(c.isActive ?? true);
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelCouponEdit = () => {
    setEditingCouponId(null);
    setCouponCode("");
    setCouponType("percentage");
    setCouponValue("");
    setCouponMinOrder("");
    setCouponMaxDiscount("");
    setCouponDescription("");
    setCouponIsActive(true);
  };

  const handleToggleCoupon = async (c: Coupon) => {
    if (!c.id) return;
    try {
      const newStatus = !c.isActive;
      await updateDoc(doc(db, "coupons", c.id), { isActive: newStatus });
      toast.success(`Coupon ${c.code} is now ${newStatus ? 'Active' : 'Inactive'}`);
      fetchCoupons();
    } catch (error) {
      console.error("Error toggling coupon status", error);
      toast.error("Failed to update coupon status");
    }
  };

  const handleDeleteCoupon = async (couponId: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await deleteDoc(doc(db, "coupons", couponId));
      toast.success(`Coupon ${code} deleted`);
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon", error);
      toast.error("Failed to delete coupon");
    }
  };

  const handleSeedCoupons = async () => {
    try {
      const starterCoupons = [
        {
          code: "WELCOME10",
          type: "percentage" as const,
          value: 10,
          minOrder: 1000,
          maxDiscount: 1000,
          description: "10% off on luxury fragrances (Min. Rs. 1,000, Max Rs. 1,000)",
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          code: "FLAT500",
          type: "fixed" as const,
          value: 500,
          minOrder: 2500,
          maxDiscount: 0,
          description: "Flat Rs. 500 off on orders above Rs. 2,500",
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      for (const sc of starterCoupons) {
        await addDoc(collection(db, "coupons"), sc);
      }
      toast.success("Starter coupons seeded!");
      fetchCoupons();
    } catch (error) {
      console.error("Error seeding coupons", error);
      toast.error("Failed to seed coupons");
    }
  };

  const [homepageSettings, setHomepageSettings] = useState({
    announcementBarEnabled: true,
    announcementBarText: "Free Shipping above 999 INR | FLAT 10% OFF On Orders above 2499 INR (Automatically Applied) | COD Eligible Above 999 INR",
    recommendedProductIds: [] as string[],
    heroBanner: "",
    categoryMen: "",
    categoryWomen: "",
    categoryUnisex: "",
    categoryPerfumeRange: "",
    categoryOilRange: "",
    promoBanner: "",
    invoicePrefix: "SHIVARTH-2026-27/",
    nextInvoiceSequence: 1,
    availableNotes: NOTES
  });
  const [newSettingNote, setNewSettingNote] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("");

  const handleAddRecommendedProduct = (productId: string | number) => {
    const idStr = String(productId);
    if (!homepageSettings.recommendedProductIds?.includes(idStr)) {
      setHomepageSettings(prev => ({
        ...prev,
        recommendedProductIds: [...(prev.recommendedProductIds || []), idStr]
      }));
      toast.success("Product added to Recommended list! Click 'Save' to apply.");
    }
  };

  const handleRemoveRecommendedProduct = (productId: string | number) => {
    const idStr = String(productId);
    setHomepageSettings(prev => ({
      ...prev,
      recommendedProductIds: (prev.recommendedProductIds || []).filter(id => id !== idStr)
    }));
    toast.success("Product removed from Recommended list.");
  };

  const handleMoveRecommendedProduct = (index: number, direction: 'up' | 'down') => {
    const list = [...(homepageSettings.recommendedProductIds || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setHomepageSettings(prev => ({ ...prev, recommendedProductIds: list }));
  };

  const handleToggleRecommendedProductInList = async (productId: string | number) => {
    const idStr = String(productId);
    const isCurrently = homepageSettings.recommendedProductIds?.includes(idStr);
    const updatedIds = isCurrently
      ? (homepageSettings.recommendedProductIds || []).filter(id => id !== idStr)
      : [...(homepageSettings.recommendedProductIds || []), idStr];

    setHomepageSettings(prev => ({ ...prev, recommendedProductIds: updatedIds }));

    try {
      await setDoc(doc(db, "settings", "homepage"), { recommendedProductIds: updatedIds }, { merge: true });
      try {
        localStorage.setItem("mijaz_recommended_products", JSON.stringify(updatedIds));
      } catch (e) {
        console.warn("Storage cache warning:", e);
      }
      toast.success(isCurrently ? "Removed from Recommended!" : "Added to Recommended!");
    } catch (e) {
      console.error("Failed to update recommended status:", e);
      toast.error("Failed to update recommended status");
    }
  };

  const fetchHomepageSettings = async () => {
    try {
      const docRef = doc(db, "settings", "homepage");
      const docSnap = await getDoc(docRef);
      let combined: any = docSnap.exists() ? docSnap.data() : {};

      // Load individual image documents
      const imgSnap = await getDocs(collection(db, "homepage_images"));
      imgSnap.forEach((d) => {
        const data = d.data();
        if (data?.url) combined[d.id] = data.url;
      });

      setHomepageSettings((prev) => ({
        ...prev,
        ...combined,
        announcementBarEnabled: combined.announcementBarEnabled !== undefined ? Boolean(combined.announcementBarEnabled) : prev.announcementBarEnabled,
        announcementBarText: typeof combined.announcementBarText === "string" ? combined.announcementBarText : prev.announcementBarText,
        recommendedProductIds: Array.isArray(combined.recommendedProductIds)
          ? combined.recommendedProductIds.map(String)
          : prev.recommendedProductIds || []
      }));
    } catch (error) {
      console.error("Error fetching homepage settings", error);
    }
  };

  const saveHomepageSettings = async () => {
    setSavingSettings(true);
    try {
      const imageKeys = [
        "heroBanner", "categoryMen", "categoryWomen", 
        "categoryUnisex", "categoryPerfumeRange", "categoryOilRange", "promoBanner"
      ];

      // 1. Save general settings without large image payloads into settings/homepage (< 2KB)
      const generalData: any = {};
      const imagesPayload: any = {};

      for (const [key, value] of Object.entries(homepageSettings)) {
        if (imageKeys.includes(key)) {
          imagesPayload[key] = value || "";
        } else {
          generalData[key] = value;
        }
      }

      await setDoc(doc(db, "settings", "homepage"), generalData);

      // 2. Save each image to its own document in homepage_images (each has its own 1MB limit!)
      for (const key of imageKeys) {
        const url = imagesPayload[key];
        await setDoc(doc(db, "homepage_images", key), { url: url || "" }, { merge: true });
      }

      // 3. Cache locally to eliminate any flicker on refresh
      try {
        localStorage.setItem("mijaz_homepage_images", JSON.stringify(imagesPayload));
        localStorage.setItem("mijaz_recommended_products", JSON.stringify(homepageSettings.recommendedProductIds || []));
      } catch (e) {
        console.warn("Local storage cache warning:", e);
      }

      // 4. Immediately sync with Zustand useCart store
      useCart.getState().setAnnouncementBarEnabled(homepageSettings.announcementBarEnabled);
      useCart.getState().setAnnouncementBarText(homepageSettings.announcementBarText);

      toast.success("Homepage settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving homepage settings", error);
      toast.error(error?.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSettingsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("Processing image...", { id: "upload" });
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 900;
          const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
          canvas.width = Math.round(img.width * scaleSize);
          canvas.height = Math.round(img.height * scaleSize);

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Compress to JPEG with 0.70 quality for crisp quality and small size (< 60KB)
          const base64Url = canvas.toDataURL("image/jpeg", 0.70);
          setHomepageSettings(prev => ({ ...prev, [key]: base64Url }));
          toast.success("Image selected! Click 'Save Settings' below to apply.", { id: "upload" });
        };
        img.onerror = () => {
          toast.error("Failed to load image file.", { id: "upload" });
        };
      };
      reader.onerror = () => {
        toast.error("Failed to read image file.", { id: "upload" });
      };
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image", { id: "upload" });
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

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice/order?")) return;
    try {
      await deleteDoc(doc(db, "orders", id));
      toast.success("Order/Invoice deleted successfully!");
      fetchOrders();
    } catch (error: any) {
      toast.error("Failed to delete order/invoice.");
      console.error(error);
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
          canvas.width = Math.round(img.width * scaleSize);
          canvas.height = Math.round(img.height * scaleSize);
          
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Compress to JPEG with 0.75 quality (~40-50 KB per photo)
          const base64Url = canvas.toDataURL("image/jpeg", 0.75);
          resolve(base64Url);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setUploading(true);
    const toastId = toast.loading(`Processing ${files.length} photo${files.length > 1 ? 's' : ''}...`);
    try {
      const compressedList: string[] = [];
      for (const file of files) {
        try {
          const res = await compressImage(file);
          compressedList.push(res);
        } catch (err) {
          console.error("Error processing file", file.name, err);
        }
      }
      
      if (compressedList.length > 0) {
        setImgUrls(prev => {
          const updated = [...prev, ...compressedList];
          setImgUrl(updated[0] || "");
          return updated;
        });
        toast.success(`Added ${compressedList.length} photo${compressedList.length > 1 ? 's' : ''}!`, { id: toastId });
      } else {
        toast.error("Could not process selected image(s).", { id: toastId });
      }
    } catch (err: any) {
      toast.error("Failed to process images.", { id: toastId });
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = imgUrls.filter((_, i) => i !== index);
    setImgUrls(updated);
    setImgUrl(updated[0] || "");
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    const target = imgUrls[index];
    const rest = imgUrls.filter((_, i) => i !== index);
    const updated = [target, ...rest];
    setImgUrls(updated);
    setImgUrl(updated[0] || "");
    toast.success("Cover photo updated!");
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
        const sell30 = Number(price30ml);
        const mrp30 = mrp30ml ? Number(mrp30ml) : sell30;
        finalPrices["30ml"] = mrp30 > sell30 ? mrp30 : sell30;
        finalSalePrices["30ml"] = sell30;
        finalStock["30ml"] = Number(stock30ml);
      }
      if (sizeOption === "50ml" || sizeOption === "Both") {
        finalSizes.push("50ml");
        const sell50 = Number(price50ml);
        const mrp50 = mrp50ml ? Number(mrp50ml) : sell50;
        finalPrices["50ml"] = mrp50 > sell50 ? mrp50 : sell50;
        finalSalePrices["50ml"] = sell50;
        finalStock["50ml"] = Number(stock50ml);
      }

      const finalImages = imgUrls.length > 0 ? imgUrls : (imgUrl ? [imgUrl] : []);
      const primaryImg = finalImages[0] || "";

      const productData = {
        name,
        description,
        narrative,
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
        img: primaryImg,
        images: finalImages,
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
      setMrp30ml("");
      setPrice50ml("");
      setMrp50ml("");
      setStock30ml("");
      setStock50ml("");
      setSizeOption("50ml");
      setDescription("");
      setNarrative("");
      setWearGuide("");
      setGiftingDetails("");
      setImgUrl("");
      setImgUrls([]);
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
      const sell30 = p.salePrices?.["30ml"] || p.price || "";
      const orig30 = p.prices?.["30ml"] || "";
      setPrice30ml(sell30 ? String(sell30) : "");
      setMrp30ml(orig30 && sell30 && Number(orig30) > Number(sell30) ? String(orig30) : "");

      const sell50 = p.salePrices?.["50ml"] || p.price || "";
      const orig50 = p.prices?.["50ml"] || "";
      setPrice50ml(sell50 ? String(sell50) : "");
      setMrp50ml(orig50 && sell50 && Number(orig50) > Number(sell50) ? String(orig50) : "");

      setStock30ml(p.stock?.["30ml"] ?? "");
      setStock50ml(p.stock?.["50ml"] ?? "");
    } else if (p.sizes?.includes("30ml")) {
      setSizeOption("30ml");
      const sell30 = p.salePrices?.["30ml"] || p.price || "";
      const orig30 = p.prices?.["30ml"] || "";
      setPrice30ml(sell30 ? String(sell30) : "");
      setMrp30ml(orig30 && sell30 && Number(orig30) > Number(sell30) ? String(orig30) : "");
      setPrice50ml("");
      setMrp50ml("");
      setStock30ml(p.stock?.["30ml"] ?? "");
      setStock50ml("");
    } else {
      setSizeOption("50ml");
      setPrice30ml("");
      setMrp30ml("");
      const sell50 = p.salePrices?.["50ml"] || p.price || "";
      const orig50 = p.prices?.["50ml"] || "";
      setPrice50ml(sell50 ? String(sell50) : "");
      setMrp50ml(orig50 && sell50 && Number(orig50) > Number(sell50) ? String(orig50) : "");
      setStock30ml("");
      setStock50ml(p.stock?.["50ml"] ?? "");
    }
    setDescription(p.description);
    setNarrative(p.narrative || "");
    setWearGuide(p.wearGuide || "");
    setGiftingDetails(p.giftingDetails || "");
    const existingImages: string[] = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.img ? [p.img] : []);
    setImgUrls(existingImages);
    setImgUrl(existingImages[0] || p.img || "");
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
        discountPercentage: comboDiscount,
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
      setComboDiscount(0);
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
    setComboDiscount(c.discountPercentage || 0);
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

      <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap">
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
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 px-2 uppercase tracking-widest text-xs font-bold flex items-center gap-1.5 ${activeTab === 'coupons' ? 'border-b-2 border-[#800000] text-[#800000]' : 'text-gray-400 hover:text-gray-800'}`}
        >
          <span>Coupons</span>
          {coupons.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'coupons' ? 'bg-[#800000] text-white' : 'bg-gray-100 text-gray-600'}`}>
              {coupons.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('homepage')}
          className={`pb-3 px-2 uppercase tracking-widest text-xs font-bold ${activeTab === 'homepage' ? 'border-b-2 border-[#800000] text-[#800000]' : 'text-gray-400 hover:text-gray-800'}`}
        >
          Homepage
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-2 uppercase tracking-widest text-xs font-bold ${activeTab === 'settings' ? 'border-b-2 border-[#800000] text-[#800000]' : 'text-gray-400 hover:text-gray-800'}`}
        >
          Settings / Scent Notes
        </button>
      </div>

      {activeTab === 'homepage' ? (
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold mb-6">Homepage Settings</h2>
          <div className="bg-gray-50 p-6 border border-gray-100 rounded-xl space-y-8">
            
            {/* Top Announcement Bar Configuration */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#800000]/10 text-[#800000] rounded-lg mt-0.5">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                        Top Announcement Bar
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        homepageSettings.announcementBarEnabled 
                          ? "bg-green-100 text-green-700 border border-green-200" 
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}>
                        {homepageSettings.announcementBarEnabled ? "Visible" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Controls the top header strip pinned across the entire storefront.
                    </p>
                  </div>
                </div>
                
                {/* Toggle switch */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600">
                    {homepageSettings.announcementBarEnabled ? "Show Banner" : "Hide Banner"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={homepageSettings.announcementBarEnabled}
                      onChange={(e) => setHomepageSettings(prev => ({ ...prev, announcementBarEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800000]"></div>
                  </label>
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Live Preview</span>
                  <span className="text-[10px] text-gray-400">
                    {homepageSettings.announcementBarEnabled ? "Displays live on all store pages" : "Hidden on all pages"}
                  </span>
                </div>
                {homepageSettings.announcementBarEnabled ? (
                  <div className="bg-[#111111] text-white text-center py-2 px-4 text-[11px] font-normal tracking-wide rounded-lg shadow-inner font-sans">
                    {homepageSettings.announcementBarText?.trim() || "Free Shipping above 999 INR | FLAT 10% OFF On Orders above 2499 INR | COD Eligible"}
                  </div>
                ) : (
                  <div className="bg-gray-100 border border-dashed border-gray-300 text-gray-400 text-center py-2 px-4 text-[11px] rounded-lg italic">
                    Announcement bar is turned OFF and hidden from customers
                  </div>
                )}
              </div>

              {/* Textarea for message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Announcement Message
                  </label>
                  <button
                    type="button"
                    onClick={() => setHomepageSettings(prev => ({
                      ...prev,
                      announcementBarText: "Free Shipping above 999 INR | FLAT 10% OFF On Orders above 2499 INR (Automatically Applied) | COD Eligible Above 999 INR"
                    }))}
                    className="text-[11px] text-[#800000] hover:underline font-semibold"
                  >
                    Reset to Default Text
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={homepageSettings.announcementBarText}
                  onChange={(e) => setHomepageSettings(prev => ({ ...prev, announcementBarText: e.target.value }))}
                  placeholder="e.g. Free Shipping above 999 INR | FLAT 10% OFF On Orders above 2499 INR (Automatically Applied) | COD Eligible Above 999 INR"
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-hidden leading-relaxed"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Use the vertical pipe <span className="font-mono text-gray-700 font-bold">|</span> separator to separate multiple offers or details.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={saveHomepageSettings}
                  disabled={savingSettings}
                  className="bg-[#800000] text-white px-5 py-2.5 rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-[#600000] transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Check size={14} />
                  <span>{savingSettings ? "Saving..." : "Save Announcement Bar"}</span>
                </button>
              </div>
            </div>

            {/* Specials: Recommended Products Configuration */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg mt-0.5">
                    <Star size={20} className="fill-amber-500/20" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                        Specials / Recommended Products Slider
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                        {homepageSettings.recommendedProductIds?.length || 0} Selected
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Curate which real products from your catalog appear in the dark "Specials / Recommended" slider on the homepage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Product Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Add Product to Recommended Slider
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedProductToAdd}
                    onChange={(e) => setSelectedProductToAdd(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg p-2.5 text-xs bg-white focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-hidden"
                  >
                    <option value="">-- Choose a product from your catalog --</option>
                    {products
                      .filter(p => !homepageSettings.recommendedProductIds?.includes(String(p.id)))
                      .map(p => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name} {p.category ? `(${p.category})` : ""} - Rs. {p.salePrices?.["50ml"] || p.salePrices?.["30ml"] || p.price || 0}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedProductToAdd) {
                        handleAddRecommendedProduct(selectedProductToAdd);
                        setSelectedProductToAdd("");
                      }
                    }}
                    disabled={!selectedProductToAdd}
                    className="bg-[#800000] text-white px-5 py-2.5 rounded-lg uppercase tracking-wider text-xs font-bold hover:bg-[#600000] transition disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Add to Slider</span>
                  </button>
                </div>
              </div>

              {/* Currently Selected Products List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Currently Selected Products ({homepageSettings.recommendedProductIds?.length || 0})
                  </span>
                  {homepageSettings.recommendedProductIds?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setHomepageSettings(prev => ({ ...prev, recommendedProductIds: [] }))}
                      className="text-[10px] text-red-500 hover:underline font-semibold cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {(!homepageSettings.recommendedProductIds || homepageSettings.recommendedProductIds.length === 0) ? (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-xs text-gray-500">
                    No products manually selected yet. Currently showing first products from catalog. Choose products above to curate this section!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {homepageSettings.recommendedProductIds.map((id, index) => {
                      const prod = products.find(p => String(p.id) === String(id));
                      const img = prod?.img || (Array.isArray(prod?.images) && prod?.images[0]) || "";
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-bold text-gray-400 w-5 text-center">
                              #{index + 1}
                            </span>
                            {img ? (
                              <img src={img} alt={prod?.name || "Product"} className="w-10 h-12 object-cover rounded shadow-xs" />
                            ) : (
                              <div className="w-10 h-12 bg-gray-200 rounded flex items-center justify-center text-[9px] text-gray-400">
                                No img
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 truncate">
                                {prod?.name || `Product ID: ${id}`}
                              </h4>
                              <p className="text-[10px] text-gray-500 truncate">
                                {prod?.notes?.slice(0, 3).join(" · ") || prod?.category || "Perfume"} · Rs. {prod?.salePrices?.["50ml"] || prod?.price || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveRecommendedProduct(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                              title="Move Earlier in Slider"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveRecommendedProduct(index, 'down')}
                              disabled={index === homepageSettings.recommendedProductIds.length - 1}
                              className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                              title="Move Later in Slider"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveRecommendedProduct(id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer ml-1"
                              title="Remove from Recommended"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={saveHomepageSettings}
                  disabled={savingSettings}
                  className="bg-[#800000] text-white px-5 py-2.5 rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-[#600000] transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Check size={14} />
                  <span>{savingSettings ? "Saving..." : "Save Recommended Products"}</span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                Storefront Images & Banners
              </h3>
            </div>

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
            
            {/* Multiple Product Photos Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Product Photos ({imgUrls.length})
                </label>
                {imgUrls.length > 0 && (
                  <span className="text-[10px] text-[#800000] font-bold">
                    ★ First photo is the main cover
                  </span>
                )}
              </div>

              {imgUrls.length === 0 ? (
                <label className="border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:bg-gray-100 hover:border-[#800000] transition rounded-lg flex flex-col items-center justify-center min-h-[140px] group block">
                  <div className="w-12 h-12 rounded-full bg-[#800000]/10 flex items-center justify-center mb-3 group-hover:bg-[#800000]/20 transition">
                    <UploadCloud className="text-[#800000]" size={24} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 mb-1">
                    {uploading ? "Processing Photos..." : "Upload Product Photos"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Click to select 1 or multiple photos (JPG, PNG, WEBP)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imgUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-white group shadow-xs ${
                          idx === 0 ? "border-[#800000] ring-2 ring-[#800000]/20" : "border-gray-200"
                        }`}
                      >
                        <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                        {/* Cover Badge */}
                        {idx === 0 ? (
                          <span className="absolute top-1.5 left-1.5 bg-[#800000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 z-10">
                            <Star size={10} className="fill-white" /> COVER
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetCoverPhoto(idx)}
                            className="absolute top-1.5 left-1.5 bg-black/80 hover:bg-[#800000] text-white text-[9px] font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm z-10"
                            title="Set as main cover photo"
                          >
                            <Star size={10} /> Set Cover
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition shadow-sm z-10"
                          title="Remove photo"
                        >
                          <X size={12} />
                        </button>

                        <div className="absolute bottom-1 left-1.5 text-[9px] font-semibold text-white/90 bg-black/60 px-1 rounded z-10">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}

                    {/* Add More Photos Tile */}
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-[#800000] hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center p-3 text-center transition group">
                      <Plus size={20} className="text-gray-400 group-hover:text-[#800000] mb-1 transition" />
                      <span className="text-[11px] font-bold text-gray-600 group-hover:text-[#800000] transition">
                        Add More
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    💡 <b>Tip:</b> Click <b>"Set Cover"</b> on any photo to make it the primary thumbnail shown on the shop page.
                  </p>
                </div>
              )}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Selling Price 30ml (₹)*
                    </label>
                    <input 
                      type="number" 
                      value={price30ml} 
                      onChange={e => setPrice30ml(e.target.value)} 
                      className="w-full border p-2 rounded bg-white text-xs font-medium focus:border-[#800000]" 
                      placeholder="e.g. 500"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Original / MRP (₹) <span className="text-[10px] text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input 
                      type="number" 
                      value={mrp30ml} 
                      onChange={e => setMrp30ml(e.target.value)} 
                      className="w-full border p-2 rounded bg-white text-xs placeholder:text-gray-400 focus:border-[#800000]" 
                      placeholder="e.g. 700 (triggers SALE)" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Stock 30ml*
                    </label>
                    <input 
                      type="number" 
                      value={stock30ml} 
                      onChange={e => setStock30ml(e.target.value)} 
                      className="w-full border p-2 rounded bg-white text-xs font-medium focus:border-[#800000]" 
                      required 
                    />
                  </div>
                </div>
              )}
              
              {(sizeOption === "50ml" || sizeOption === "Both") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Selling Price 50ml (₹)*
                    </label>
                    <input 
                      type="number" 
                      value={price50ml} 
                      onChange={e => setPrice50ml(e.target.value)} 
                      className="w-full border p-2 rounded bg-white text-xs font-medium focus:border-[#800000]" 
                      placeholder="e.g. 600"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Original / MRP (₹) <span className="text-[10px] text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input 
                      type="number" 
                      value={mrp50ml} 
                      onChange={e => setMrp50ml(e.target.value)} 
                      className="w-full border p-2 rounded bg-white text-xs placeholder:text-gray-400 focus:border-[#800000]" 
                      placeholder="e.g. 800 (triggers SALE)" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Stock 50ml*
                    </label>
                    <input 
                      type="number" 
                      value={stock50ml} 
                      onChange={e => setStock50ml(e.target.value)} 
                      className="w-full border p-2 rounded bg-white text-xs font-medium focus:border-[#800000]" 
                      required 
                    />
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
                {Array.from(new Set([...(homepageSettings.availableNotes || NOTES), ...selectedNotes])).map(note => (
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
                disabled={uploading || (imgUrls.length === 0 && !imgUrl)}
                className={`flex-1 text-white py-3 uppercase tracking-widest text-xs font-bold transition-colors ${
                  uploading || (imgUrls.length === 0 && !imgUrl) ? "bg-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#5a0000]"
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
                    setMrp30ml("");
                    setPrice50ml("");
                    setMrp50ml("");
                    setSizeOption("50ml");
                    setDescription("");
                    setNarrative("");
                    setWearGuide("");
                    setGiftingDetails("");
                    setImgUrl("");
                    setImgUrls([]);
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
                        {p.img && <img src={p.img} alt={p.name} className="w-9 h-11 object-cover rounded shadow-xs" />}
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{p.name}</span>
                          {Array.isArray(p.images) && p.images.length > 1 && (
                            <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                              📷 {p.images.length} photos
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const sell = p.salePrices?.["50ml"] || p.salePrices?.["30ml"] || p.price;
                          const orig = p.prices?.["50ml"] || p.prices?.["30ml"];
                          const isDiscounted = orig && sell && Number(orig) > Number(sell);
                          return (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">Rs. {sell}</span>
                              {isDiscounted && (
                                <>
                                  <span className="text-xs text-gray-400 line-through">Rs. {orig}</span>
                                  <span className="bg-[#D4AF37] text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    SALE
                                  </span>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleRecommendedProductInList(p.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors mr-3 cursor-pointer inline-flex items-center gap-1 ${
                            homepageSettings.recommendedProductIds?.includes(String(p.id))
                              ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-amber-50 hover:text-amber-700"
                          }`}
                          title={homepageSettings.recommendedProductIds?.includes(String(p.id)) ? "Remove from homepage Specials slider" : "Feature in homepage Specials slider"}
                        >
                          <Star size={12} className={homepageSettings.recommendedProductIds?.includes(String(p.id)) ? "fill-amber-500 text-amber-600" : "text-gray-400"} />
                          <span>{homepageSettings.recommendedProductIds?.includes(String(p.id)) ? "Recommended" : "Recommend"}</span>
                        </button>
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
                        const newProdId = e.target.value;
                        newItems[index].productId = newProdId;
                        
                        // Auto-select the first available size
                        const prod = products.find(p => String(p.id) === String(newProdId));
                        if (prod) {
                          if (prod.stock50ml && Number(prod.stock50ml) > 0) newItems[index].size = "50ml";
                          else if (prod.stock30ml && Number(prod.stock30ml) > 0) newItems[index].size = "30ml";
                        }
                        
                        setComboItems(newItems);
                      }}
                      className="flex-1 border p-2 text-xs"
                      required
                    >
                      <option value="">Select Product...</option>
                      {products
                        .filter(p => {
                          if (!p.stock) return true; // Legacy product, no explicit stock
                          // Out of stock if ALL sizes have 0 or less stock
                          const allOutOfStock = (p.sizes || []).every(size => !p.stock![size] || p.stock![size] <= 0);
                          return !allOutOfStock;
                        })
                        .map(p => {
                          const stockText = [];
                          if (p.stock?.["30ml"] && Number(p.stock["30ml"]) > 0) stockText.push(`${p.stock["30ml"]}x30ml`);
                          if (p.stock?.["50ml"] && Number(p.stock["50ml"]) > 0) stockText.push(`${p.stock["50ml"]}x50ml`);
                          
                          let label = p.name;
                          if (stockText.length > 0) {
                            label += ` (${stockText.join(", ")})`;
                          }
                          return (
                            <option key={p.id} value={p.id}>{label}</option>
                          );
                      })}
                    </select>

                    {(() => {
                      const selectedProd = products.find(p => String(p.id) === String(item.productId));
                      const availableSizes = [];
                      if (selectedProd) {
                        if (selectedProd.stock?.["30ml"] && Number(selectedProd.stock["30ml"]) > 0) availableSizes.push("30ml");
                        if (selectedProd.stock?.["50ml"] && Number(selectedProd.stock["50ml"]) > 0) availableSizes.push("50ml");
                        
                        // Fallback to legacy price entries if no stock tracking is setup for this product
                        if (availableSizes.length === 0) {
                          if (selectedProd.prices?.["30ml"] || selectedProd.salePrices?.["30ml"]) availableSizes.push("30ml");
                          if (selectedProd.prices?.["50ml"] || selectedProd.salePrices?.["50ml"]) availableSizes.push("50ml");
                        }
                      }
                      
                      // Final fallback
                      if (availableSizes.length === 0) availableSizes.push("30ml", "50ml");

                      return (
                        <select
                          value={item.size}
                          onChange={(e) => {
                            const newItems = [...comboItems];
                            newItems[index].size = e.target.value;
                            setComboItems(newItems);
                          }}
                          className={`w-24 border p-2 text-xs ${!item.productId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          disabled={!item.productId}
                        >
                          {availableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      );
                    })()}
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

              {comboItems.length > 0 && (() => {
                const baseComboPrice = comboItems.reduce((sum, item) => {
                  const prod = products.find(p => String(p.id) === String(item.productId));
                  if (!prod) return sum;
                  const price = prod.salePrices?.[item.size] ?? prod.prices?.[item.size] ?? prod.price ?? 0;
                  return sum + Number(price);
                }, 0);

                return (
                  <div className="bg-white p-4 border border-gray-200 mt-4 rounded shadow-sm">
                    {/* Price Breakdown */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Price Breakdown</span>
                      {comboItems.map((item, idx) => {
                        const prod = products.find(p => String(p.id) === String(item.productId));
                        if (!prod) return null;
                        const price = prod.salePrices?.[item.size] ?? prod.prices?.[item.size] ?? prod.price ?? 0;
                        return (
                          <div key={idx} className="flex justify-between items-center text-sm mb-1 text-gray-600">
                            <span>{prod.name} <span className="text-xs opacity-70">({item.size})</span></span>
                            <span>Rs. {Number(price).toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Base Price</span>
                      <span className="font-semibold text-gray-500 text-sm">Rs. {baseComboPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-[#800000] uppercase tracking-wider">Discount (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={comboDiscount}
                        onChange={(e) => setComboDiscount(Number(e.target.value))}
                        className="border border-[#800000]/20 rounded p-1 w-20 text-right text-sm font-semibold focus:outline-none focus:border-[#800000]"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Final Price</span>
                      <span className="font-bold text-lg text-[#800000]">
                        Rs. {Math.max(0, Math.floor(baseComboPrice * (1 - comboDiscount / 100))).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}

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
                      setComboDiscount(0);
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
                      <td className="p-4 flex gap-2 items-center">
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
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Order"
                        >
                          <X size={16} />
                        </button>
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
                      <td className="p-4 flex justify-end gap-2">
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
                              state: order.shippingAddress?.state === "Store" ? "Delhi" : (order.shippingAddress?.state || "Delhi"),
                              pincode: order.shippingAddress?.pincode === "000000" ? "" : (order.shippingAddress?.pincode || ""),
                              items: (order.cart || order.items)?.map((c: any) => ({
                                name: c.name,
                                desc: c.size,
                                qty: c.quantity || c.qty || 1,
                                price: c.price,
                                amount: c.amount || (c.price * (c.quantity || c.qty || 1))
                              })) || [],
                              subtotal: order.subtotal || order.total || 0,
                              discount: order.discount || 0,
                              couponCode: order.couponCode || "",
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
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <X size={14} /> Delete
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">State</label>
                      <input type="text" value={offlineState} onChange={(e) => setOfflineState(e.target.value)} className="w-full border p-2 rounded" placeholder="Delhi" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pincode</label>
                      <input type="text" value={offlinePincode} onChange={(e) => setOfflinePincode(e.target.value)} className="w-full border p-2 rounded" placeholder="110001" />
                    </div>
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
                        
                        runTransaction(db, async (transaction) => {
                          const settingsRef = doc(db, "settings", "homepage");
                          const sfDoc = await transaction.get(settingsRef);
                          
                          let prefix = "MJZ-2026-27/";
                          let seq = 1;
                  
                          if (sfDoc.exists()) {
                            const data = sfDoc.data();
                            if (data.invoicePrefix) prefix = data.invoicePrefix;
                            if (data.nextInvoiceSequence) seq = data.nextInvoiceSequence;
                          }
                  
                          const invoiceNoStr = `${prefix}${seq.toString().padStart(3, '0')}`;
                          transaction.set(settingsRef, { nextInvoiceSequence: seq + 1 }, { merge: true });
                          return invoiceNoStr;
                        }).then((invoiceNoStr) => {
                          const docId = invoiceNoStr.replace(/\//g, '-');
                          // Save offline order to Firebase so it appears in the table
                          setDoc(doc(db, "orders", docId), {
                          orderId: invoiceNoStr,
                          createdAt: new Date().toISOString(),
                          shippingAddress: {
                            name: offlineName || "Walk-in Customer",
                            phone: offlinePhone || "N/A",
                            email: "N/A",
                            address: offlineAddress || "Store Purchase",
                            city: "Store",
                            state: offlineState || "Delhi",
                            pincode: offlinePincode || "",
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
                            fetchOrders();
                            toast.success("Offline invoice saved successfully!");
                            generateInvoicePDF({
                              invoiceNo: invoiceNoStr,
                              date: new Date().toLocaleDateString('en-GB'),
                              dueDate: new Date().toLocaleDateString('en-GB'),
                              customerName: offlineName || "Walk-in Customer",
                              email: "N/A",
                              phone: offlinePhone || "N/A",
                              address: offlineAddress || "Store Purchase",
                              state: offlineState || "Delhi",
                              pincode: offlinePincode || "",
                              items: items,
                              subtotal: total,
                              tax: 0,
                              total: total,
                              paymentDetails: "Paid in store",
                              message: "Thank you for visiting Mijaz Luxury Perfumery.",
                              jobDesc: "Offline Purchase"
                            });
                            
                            setOfflineName("");
                            setOfflinePhone("");
                            setOfflineAddress("");
                            setOfflineState("");
                            setOfflinePincode("");
                            setOfflineItems([{ productId: "", name: "", price: "", qty: "1" }]);
                            setShowOfflineModal(false);
                          }).catch(e => {
                            console.error("Failed to save offline invoice:", e);
                            toast.error("Saved locally only, database error.");
                          });
                        });
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
      ) : activeTab === 'coupons' ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
            <div>
              <h2 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Coupon & Discount Management
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Create percentage or fixed flat amount coupons to apply on checkout cart.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {coupons.length === 0 && (
                <button
                  onClick={handleSeedCoupons}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  + Seed Starter Coupons
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Create / Edit Form */}
            <div className="lg:col-span-5 bg-gray-50 p-6 border border-gray-100 rounded-xl h-fit">
              <div className="flex justify-between items-center mb-5 pb-3 border-b">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <Tag size={16} className="text-[#800000]" />
                  {editingCouponId ? "Edit Coupon" : "Create New Coupon"}
                </h3>
                {editingCouponId && (
                  <button
                    onClick={handleCancelCouponEdit}
                    className="text-xs text-gray-500 hover:text-black underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVE20, FLAT500"
                    className="w-full border p-2.5 rounded bg-white font-mono uppercase tracking-wider text-sm focus:outline-none focus:border-[#800000]"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Customers enter this code at checkout.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Discount Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCouponType("percentage")}
                      className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded border flex items-center justify-center gap-1.5 transition-all ${
                        couponType === "percentage"
                          ? "bg-[#800000] text-white border-[#800000] shadow-xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <Percent size={14} /> Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponType("fixed")}
                      className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded border flex items-center justify-center gap-1.5 transition-all ${
                        couponType === "fixed"
                          ? "bg-[#800000] text-white border-[#800000] shadow-xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span>₹ Flat Price</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    {couponType === "percentage" ? "Discount Percentage (%) *" : "Flat Discount Amount (₹) *"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">
                      {couponType === "percentage" ? "%" : "₹"}
                    </span>
                    <input
                      type="number"
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value)}
                      placeholder={couponType === "percentage" ? "e.g. 15" : "e.g. 500"}
                      min="1"
                      max={couponType === "percentage" ? "100" : undefined}
                      className="w-full border p-2.5 pl-8 rounded bg-white text-sm focus:outline-none focus:border-[#800000]"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {couponType === "percentage"
                      ? "Percentage deducted from order subtotal (max 100%)."
                      : "Fixed rupee amount deducted directly from cart total."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Min Order Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 text-xs">₹</span>
                      <input
                        type="number"
                        value={couponMinOrder}
                        onChange={(e) => setCouponMinOrder(e.target.value)}
                        placeholder="0 (Optional)"
                        min="0"
                        className="w-full border p-2 pl-7 rounded bg-white text-xs focus:outline-none focus:border-[#800000]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Max Discount Cap
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 text-xs">₹</span>
                      <input
                        type="number"
                        value={couponMaxDiscount}
                        onChange={(e) => setCouponMaxDiscount(e.target.value)}
                        placeholder="No limit"
                        min="0"
                        disabled={couponType === "fixed"}
                        className={`w-full border p-2 pl-7 rounded bg-white text-xs focus:outline-none focus:border-[#800000] ${
                          couponType === "fixed" ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Description / Banner Note
                  </label>
                  <input
                    type="text"
                    value={couponDescription}
                    onChange={(e) => setCouponDescription(e.target.value)}
                    placeholder="e.g. 10% off for new fragrance lovers"
                    className="w-full border p-2.5 rounded bg-white text-xs focus:outline-none focus:border-[#800000]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="couponIsActive"
                    checked={couponIsActive}
                    onChange={(e) => setCouponIsActive(e.target.checked)}
                    className="rounded text-[#800000] focus:ring-[#800000] h-4 w-4"
                  />
                  <label htmlFor="couponIsActive" className="text-xs font-medium text-gray-700 cursor-pointer">
                    Enable this coupon immediately
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingCoupon}
                    className="w-full py-3 bg-[#800000] text-white font-bold uppercase text-xs tracking-widest rounded hover:bg-[#5a0000] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {savingCoupon ? "Saving..." : editingCouponId ? "Update Coupon" : "Create Coupon"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: List of Coupons */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs h-fit">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  All Coupons ({coupons.length})
                </h3>
                {coupons.length > 0 && (
                  <button
                    onClick={handleSeedCoupons}
                    className="text-[11px] text-[#800000] font-semibold hover:underline"
                  >
                    + Add Demo Coupons
                  </button>
                )}
              </div>

              {coupons.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">No coupons created yet</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                      Create your first coupon using the form on the left, or seed starter coupons with one click.
                    </p>
                  </div>
                  <button
                    onClick={handleSeedCoupons}
                    className="px-5 py-2.5 bg-[#800000] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#5a0000] transition-colors cursor-pointer"
                  >
                    Seed Starter Coupons (WELCOME10 & FLAT500)
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                      <tr>
                        <th className="p-3.5">Code</th>
                        <th className="p-3.5">Discount</th>
                        <th className="p-3.5">Rules</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {coupons.map((c) => (
                        <tr key={c.id || c.code} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-gray-900">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs tracking-wider border border-gray-200">
                              {c.code}
                            </span>
                            {c.description && (
                              <p className="text-[10px] text-gray-400 font-sans font-normal mt-1 max-w-[180px] truncate">
                                {c.description}
                              </p>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-[#800000]">
                              {c.type === "percentage" ? `${c.value}% OFF` : `₹${c.value} FLAT`}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-600 text-[11px] space-y-0.5">
                            {c.minOrder ? (
                              <div>Min: <span className="font-semibold text-gray-800">₹{c.minOrder}</span></div>
                            ) : (
                              <div className="text-gray-400">No min order</div>
                            )}
                            {c.maxDiscount ? (
                              <div className="text-gray-500">Cap: ₹{c.maxDiscount}</div>
                            ) : null}
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleCoupon(c)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                c.isActive
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                              title="Click to toggle status"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              {c.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleEditCoupon(c)}
                              className="text-gray-500 hover:text-black p-1 transition-colors"
                              title="Edit coupon"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => c.id && handleDeleteCoupon(c.id, c.code)}
                              className="text-red-400 hover:text-red-600 p-1 transition-colors"
                              title="Delete coupon"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'settings' ? (
        <div className="bg-white p-6 shadow-sm rounded-sm mb-12">
          <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>General Settings</h2>
          
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-semibold border-b pb-2">Invoice & Order Sequences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Invoice/Order Prefix</label>
                <input 
                  type="text" 
                  className="w-full border p-2 focus:outline-none focus:border-[#800000]"
                  value={(homepageSettings as any).invoicePrefix || ""}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, invoicePrefix: e.target.value } as any)}
                  placeholder="e.g. SHIVARTH-2026-27/"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Next Sequence Number</label>
                <input 
                  type="number" 
                  className="w-full border p-2 focus:outline-none focus:border-[#800000]"
                  value={(homepageSettings as any).nextInvoiceSequence || 1}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, nextInvoiceSequence: parseInt(e.target.value) || 1 } as any)}
                />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold border-b pb-2 mt-8">Manage Scent Notes</h3>
            <p className="text-sm text-gray-500 mb-2">These notes will appear as options when adding products, and in the Shop page filters.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {homepageSettings.availableNotes?.map((note, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full border text-sm">
                  {note}
                  <button onClick={() => {
                    const newNotes = [...homepageSettings.availableNotes];
                    newNotes.splice(index, 1);
                    setHomepageSettings({ ...homepageSettings, availableNotes: newNotes });
                  }} className="text-gray-500 hover:text-[#800000] ml-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={newSettingNote}
                onChange={(e) => setNewSettingNote(e.target.value)}
                placeholder="New scent note (e.g. Peach)"
                className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-[#800000]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newSettingNote.trim() && !homepageSettings.availableNotes?.includes(newSettingNote.trim())) {
                      setHomepageSettings({ 
                        ...homepageSettings, 
                        availableNotes: [...(homepageSettings.availableNotes || []), newSettingNote.trim()] 
                      });
                      setNewSettingNote("");
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newSettingNote.trim() && !homepageSettings.availableNotes?.includes(newSettingNote.trim())) {
                    setHomepageSettings({ 
                      ...homepageSettings, 
                      availableNotes: [...(homepageSettings.availableNotes || []), newSettingNote.trim()] 
                    });
                    setNewSettingNote("");
                  }
                }}
                className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-bold uppercase tracking-wider rounded hover:bg-gray-200 transition-colors"
              >
                Add Note
              </button>
            </div>

            <button 
              onClick={saveHomepageSettings}
              disabled={savingSettings}
              className={`mt-6 w-full py-3 bg-[#800000] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#5a0000] transition-colors ${savingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
