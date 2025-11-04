import SparkMD5 from "spark-md5";


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!files.length && !form.images.length) {
    alert("Please select at least one image");
    return;
  }

  try {
    // 1️⃣ Upload images and generate hashes
    const results = await Promise.all(
      files.map(async (file) => {
        // Generate hash
        const arrayBuffer = await file.arrayBuffer();
        const hash = SparkMD5.ArrayBuffer.hash(arrayBuffer);

        // Upload to imgbb
        const fd = new FormData();
        fd.append("image", file);
        const r = await axios.post(
          `https://api.imgbb.com/1/upload?key=ab454291ebee91b49b021ecac51be17c`,
          fd
        );

        return { url: r.data.data.url, hash };
      })
    );

    // Extract URLs and hashes
    const uploadedUrls = results.map((r) => r.url);
    const imageHashes = results.map((r) => r.hash);

    // 2️⃣ Prepare product data
    const productData = {
      ...form,
      images: [...form.images, ...uploadedUrls],
      imageHashes: [...(form.imageHashes || []), ...imageHashes],
    };

    // 3️⃣ Send to backend
    if (editingProduct) {
      await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        productData
      );
      setEditingProduct(null);
    } else {
      await axios.post("http://localhost:5000/api/products", productData);
    }

    // 4️⃣ Reset form
    setForm(emptyForm);
    setFiles([]);
    setPreviews([]);
    fetchProducts();
    alert("✅ Product saved successfully");
  } catch (err) {
    console.error("❌ Error saving product:", err);
    alert("❌ Error saving product");
  }
};


router.post("/", async (req, res) => {
  try {
    const { images, imageHashes, ...rest } = req.body;

    // Validation
    if (!images || images.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    // Create product
    const product = await Product.create({
      ...rest,               // rest of req.body
      images,                // explicitly set images
      imageHashes: imageHashes || [], // explicitly set imageHashes
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error saving product:", err);
    res.status(400).json({ error: err.message });
  }
});