// Dynamic E-commerce Helper Logic for Zivio Standalone Pages

// Active page state variables
let activeProductTitle = "";
let currentColor = "";
let selectedEdition = "";
let quantity = 1;
let cart = [];
let reviews = [];

document.addEventListener("DOMContentLoaded", () => {
    // Determine active product from the page itself
    const titleEl = document.querySelector(".product-title");
    activeProductTitle = titleEl ? titleEl.textContent.trim() : "Default Product";

    // Load state
    loadCart();
    loadReviews();

    // Setup active options defaults
    const activeColorBtn = document.querySelector(".color-btn.active");
    currentColor = activeColorBtn ? activeColorBtn.textContent.trim() : "Default";

    const activeEditionBtn = document.querySelector(".size-btn.active");
    selectedEdition = activeEditionBtn ? activeEditionBtn.textContent.trim() : "Standard";

    // Initialize listeners
    initVariantSelector();
    initSizeSelector();
    initQuantitySelector();
    initCartDrawer();
    initAccordion();
    initZoomLens();
    initReviewsSystem();
    initThumbnailClicks();

    // Purchase triggers
    const addCartBtn = document.getElementById("btn-add-cart");
    if (addCartBtn) addCartBtn.addEventListener("click", addToCartHandler);

    const buyNowBtn = document.getElementById("btn-buy-now");
    if (buyNowBtn) buyNowBtn.addEventListener("click", buyNowHandler);
});

/* ==========================================================================
   1. Dynamic Selectors
   ========================================================================== */
function initVariantSelector() {
    const buttons = document.querySelectorAll(".color-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            buttons.forEach(b => b.classList.remove("active"));
            const targetBtn = e.currentTarget;
            targetBtn.classList.add("active");
            currentColor = targetBtn.textContent.trim();
            
            // Switch main image based on selected color variant if applicable
            const dataColor = targetBtn.getAttribute("data-color");
            const mainImg = document.getElementById("main-product-image");
            if (mainImg) {
                // If it's the main headphones page, we have dynamic images:
                if (activeProductTitle === "AeroPulse") {
                    mainImg.src = `images/${dataColor}.png`;
                    // Update thumbnails source too
                    const thumbs = document.querySelectorAll(".thumbnail-card img");
                    if (thumbs.length >= 2) {
                        thumbs[0].src = `images/${dataColor}.png`;
                        thumbs[1].src = `images/${dataColor}.png`;
                    }
                }
            }

            showToast(`Switched color to ${currentColor}`);
        });
    });
}

function initSizeSelector() {
    const buttons = document.querySelectorAll(".size-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            buttons.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            selectedEdition = e.currentTarget.textContent.trim();
            showToast(`Selected Edition: ${selectedEdition}`);
        });
    });
}

function initQuantitySelector() {
    const minusBtn = document.getElementById("qty-minus");
    const plusBtn = document.getElementById("qty-plus");
    const qtyInput = document.getElementById("qty-value");

    if (minusBtn && plusBtn && qtyInput) {
        minusBtn.addEventListener("click", () => {
            if (quantity > 1) {
                quantity--;
                qtyInput.value = quantity;
            }
        });

        plusBtn.addEventListener("click", () => {
            quantity++;
            qtyInput.value = quantity;
        });

        qtyInput.addEventListener("change", (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) {
                val = 1;
            }
            quantity = val;
            qtyInput.value = quantity;
        });
    }
}

/* ==========================================================================
   2. Gallery Swapping & Zoom Lens
   ========================================================================== */
function initThumbnailClicks() {
    const thumbs = document.querySelectorAll(".thumbnail-card");
    const mainImg = document.getElementById("main-product-image");
    
    thumbs.forEach((thumb, idx) => {
        thumb.addEventListener("click", () => {
            thumbs.forEach(tc => tc.classList.remove("active"));
            thumb.classList.add("active");
            
            const imgSrc = thumb.querySelector("img").src;
            if (mainImg) {
                mainImg.style.opacity = 0;
                setTimeout(() => {
                    mainImg.src = imgSrc;
                    if (idx === 1) {
                        mainImg.style.transform = "scale(1.2) rotate(8deg)";
                    } else {
                        mainImg.style.transform = "scale(1)";
                    }
                    mainImg.style.opacity = 1;
                }, 150);
            }
        });
    });
}

function initZoomLens() {
    const viewport = document.getElementById("main-viewport");
    const img = document.getElementById("main-product-image");
    if (!viewport || !img) return;

    // Create lens element
    const lens = document.createElement("div");
    lens.className = "zoom-lens";
    viewport.appendChild(lens);

    viewport.onmousemove = (e) => {
        lens.style.visibility = "visible";
        const rect = viewport.getBoundingClientRect();
        
        let x = e.clientX - rect.left - (lens.offsetWidth / 2);
        let y = e.clientY - rect.top - (lens.offsetHeight / 2);
        
        if (x > rect.width - lens.offsetWidth) { x = rect.width - lens.offsetWidth; }
        if (x < 0) { x = 0; }
        if (y > rect.height - lens.offsetHeight) { y = rect.height - lens.offsetHeight; }
        if (y < 0) { y = 0; }
        
        lens.style.left = x + "px";
        lens.style.top = y + "px";
        
        const ratioX = rect.width / lens.offsetWidth * 1.5;
        const ratioY = rect.height / lens.offsetHeight * 1.5;
        
        lens.style.backgroundImage = `url('${img.src}')`;
        lens.style.backgroundSize = `${rect.width * ratioX}px ${rect.height * ratioY}px`;
        
        const bgX = -((e.clientX - rect.left) * ratioX - (lens.offsetWidth / 2));
        const bgY = -((e.clientY - rect.top) * ratioY - (lens.offsetHeight / 2));
        lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
    };

    viewport.onmouseleave = () => {
        lens.style.visibility = "hidden";
    };
}

function initAccordion() {
    const headers = document.querySelectorAll(".accordion-header");
    headers.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const isActive = item.classList.contains("active");
            
            document.querySelectorAll(".accordion-item").forEach(ai => ai.classList.remove("active"));
            if (!isActive) {
                item.classList.add("active");
            }
        });
    });
}

/* ==========================================================================
   3. Shopping Cart Logic
   ========================================================================== */
function initCartDrawer() {
    const cartBtn = document.getElementById("cart-trigger-btn");
    const closeBtn = document.getElementById("cart-close");
    const overlay = document.getElementById("cart-overlay");

    if (cartBtn && closeBtn && overlay) {
        cartBtn.addEventListener("click", () => {
            overlay.classList.add("active");
        });

        closeBtn.addEventListener("click", () => {
            overlay.classList.remove("active");
        });

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active");
            }
        });
    }
}

function addToCartHandler() {
    const mainImg = document.getElementById("main-product-image");
    const currentPriceText = document.getElementById("current-price");
    const price = currentPriceText ? parseFloat(currentPriceText.textContent.replace('$', '')) : 249.99;

    const cartItem = {
        id: `${activeProductTitle.replace(/\s+/g, '-').toLowerCase()}-${currentColor.toLowerCase()}-${selectedEdition.replace(/\s+/g, '-').toLowerCase()}`,
        name: activeProductTitle,
        color: currentColor,
        size: selectedEdition,
        price: price,
        image: mainImg ? mainImg.getAttribute("src") : "images/cyber_neon.png",
        quantity: quantity
    };

    const existingIndex = cart.findIndex(item => item.id === cartItem.id);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    saveCart();
    renderCart();
    document.getElementById("cart-overlay").classList.add("active");
    showToast(`Added ${quantity}x ${activeProductTitle} to cart!`);
}

function buyNowHandler() {
    addToCartHandler();
    setTimeout(() => {
        alert("Redirecting to secure Zivio checkout simulation...");
    }, 500);
}

function loadCart() {
    const stored = localStorage.getItem("zivio_cart");
    if (stored) {
        try {
            cart = JSON.parse(stored);
        } catch(e) {
            cart = [];
        }
    }
    renderCart();
}

function saveCart() {
    localStorage.setItem("zivio_cart", JSON.stringify(cart));
}

function renderCart() {
    const list = document.getElementById("cart-items-list");
    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");
    const badge = document.getElementById("cart-count-badge");
    
    if (!list) return;
    list.innerHTML = "";
    
    let totalItems = 0;
    let subtotal = 0;

    if (cart.length === 0) {
        list.innerHTML = `<div class="empty-cart-msg">Your shopping cart is empty.</div>`;
    } else {
        cart.forEach(item => {
            totalItems += item.quantity;
            subtotal += item.price * item.quantity;

            const itemEl = document.createElement("div");
            itemEl.className = "cart-item";
            itemEl.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Color: ${item.color} | Edition: ${item.size}</p>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Qty:</span>
                        <button class="cart-qty-adjust" onclick="adjustCartQty('${item.id}', -1)" style="background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border); border-radius: 4px; color:#fff; width:22px; height:22px; cursor:pointer;">-</button>
                        <span style="font-size: 0.9rem; font-weight:600; width: 15px; text-align:center;">${item.quantity}</span>
                        <button class="cart-qty-adjust" onclick="adjustCartQty('${item.id}', 1)" style="background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border); border-radius: 4px; color:#fff; width:22px; height:22px; cursor:pointer;">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-item-remove-btn" onclick="removeFromCart('${item.id}')">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            `;
            list.appendChild(itemEl);
        });
    }

    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? "flex" : "none";
    }
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

window.adjustCartQty = function(itemId, amount) {
    const idx = cart.findIndex(item => item.id === itemId);
    if (idx > -1) {
        cart[idx].quantity += amount;
        if (cart[idx].quantity <= 0) {
            cart.splice(idx, 1);
        }
        saveCart();
        renderCart();
    }
};

window.removeFromCart = function(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    renderCart();
    showToast("Removed item from cart.");
};

window.addShelfItemToCart = function(name, price, img, variant) {
    const item = {
        id: `shelf-${name.replace(/\s+/g, '-').toLowerCase()}`,
        name: name,
        color: variant,
        size: "Standard",
        price: price,
        image: img,
        quantity: 1
    };

    const existingIndex = cart.findIndex(cItem => cItem.id === item.id);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push(item);
    }

    saveCart();
    renderCart();
    document.getElementById("cart-overlay").classList.add("active");
    showToast(`Added ${name} to cart!`);
};

/* ==========================================================================
   4. Reviews System
   ========================================================================== */
let reviewRatingInput = 5;

const DEFAULT_REVIEWS = {
    "AeroPulse": [
        { id: 1, author: "Aarav Sharma", rating: 5, date: "08 June 2026", content: "Absolutely mindblowing! The sound quality feels holographic, and the ANC blocks out every single noise. The Cyber Neon glow matches my setup perfectly." },
        { id: 2, author: "Neha Patel", rating: 4, date: "05 June 2026", content: "Very comfortable for long gaming or coding sessions. Bass is punchy, and the glassmorphism panel looks extremely futuristic." },
        { id: 3, author: "Vikram Malhotra", rating: 5, date: "28 May 2026", content: "Awesome build quality. The spatial audio tracking works flawlessly on these. Def worth the premium price." }
    ],
    "Aura Smart Ring": [
        { id: 1, author: "Rohit Verma", rating: 5, date: "09 June 2026", content: "Super lightweight, I forget I'm even wearing it. The sleep tracking is highly detailed and accurate. Great app dashboard!" }
    ],
    "NovaVR Glasses": [
        { id: 1, author: "Ishaan Sen", rating: 5, date: "07 June 2026", content: "The HUD display is bright enough to see even under bright sunlight. Translate mode worked wonders for me during my trip!" }
    ],
    "Chrono Watch": [
        { id: 1, author: "Aditya Das", rating: 5, date: "04 June 2026", content: "Looks like something straight out of a Sci-Fi movie. Watch face designs are stellar. Tracking metrics are spot on." }
    ],
    "Aether Pods": [
        { id: 1, author: "Meera Nair", rating: 5, date: "06 June 2026", content: "The bass is exceptionally clear and the spatial soundstage makes listening to movies so immersive! Design is beautiful." }
    ],
    "Prism Speaker": [
        { id: 1, author: "Rajesh K.", rating: 4, date: "30 May 2026", content: "The visualizer is an absolute party starter! Sound fills up a large living room easily. Bass can be a bit heavy but custom EQ app solves it." }
    ]
};

function initReviewsSystem() {
    const openFormBtn = document.getElementById("btn-write-review");
    const closeFormBtn = document.getElementById("close-review-modal");
    const modalOverlay = document.getElementById("review-modal-overlay");
    const reviewForm = document.getElementById("review-form");

    if (openFormBtn) {
        openFormBtn.addEventListener("click", () => {
            modalOverlay.classList.add("active");
        });
    }

    if (closeFormBtn) {
        closeFormBtn.addEventListener("click", () => {
            modalOverlay.classList.remove("active");
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove("active");
            }
        });
    }

    const stars = document.querySelectorAll(".rating-star-option");
    stars.forEach(star => {
        star.addEventListener("click", (e) => {
            reviewRatingInput = parseInt(e.currentTarget.getAttribute("data-value"));
            stars.forEach(s => {
                const val = parseInt(s.getAttribute("data-value"));
                if (val <= reviewRatingInput) {
                    s.className = "ri-star-fill rating-star-option selected";
                } else {
                    s.className = "ri-star-line rating-star-option";
                }
            });
        });
    });

    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const authorInput = document.getElementById("review-author").value.trim();
            const contentInput = document.getElementById("review-content").value.trim();

            if (!authorInput || !contentInput) return;

            const newReview = {
                id: Date.now(),
                author: authorInput,
                rating: reviewRatingInput,
                date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' }),
                content: contentInput
            };

            reviews.unshift(newReview);
            saveReviews();
            renderReviews();
            
            reviewForm.reset();
            reviewRatingInput = 5;
            stars.forEach(s => {
                s.className = "ri-star-fill rating-star-option selected";
            });
            modalOverlay.classList.remove("active");
            
            showToast("Review submitted successfully!");
        });
    }

    const filterTabs = document.querySelectorAll(".filter-tab");
    filterTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            filterTabs.forEach(t => t.classList.remove("active"));
            e.currentTarget.classList.add("active");
            const filterValue = e.currentTarget.getAttribute("data-filter");
            renderReviews(filterValue);
        });
    });
}

function loadReviews() {
    const key = `zivio_reviews_${activeProductTitle.replace(/\s+/g, '_').toLowerCase()}`;
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            reviews = JSON.parse(stored);
        } catch(e) {
            reviews = DEFAULT_REVIEWS[activeProductTitle] || [];
        }
    } else {
        reviews = DEFAULT_REVIEWS[activeProductTitle] || [];
        localStorage.setItem(key, JSON.stringify(reviews));
    }
    renderReviews();
}

function saveReviews() {
    const key = `zivio_reviews_${activeProductTitle.replace(/\s+/g, '_').toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(reviews));
}

function renderReviews(filter = "all") {
    const listEl = document.getElementById("reviews-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const filteredReviews = reviews.filter(rev => {
        if (filter === "all") return true;
        return rev.rating === parseInt(filter);
    });

    const totalReviews = reviews.length;
    let sum = 0;
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(r => {
        sum += r.rating;
        if (starCounts[r.rating] !== undefined) {
            starCounts[r.rating]++;
        }
    });

    const averageRating = totalReviews > 0 ? (sum / totalReviews).toFixed(1) : "0.0";
    
    const avgVal = document.getElementById("avg-rating-value");
    if (avgVal) avgVal.textContent = averageRating;

    const avgStars = document.getElementById("avg-rating-stars");
    if (avgStars) avgStars.innerHTML = getStarsHTML(Math.round(parseFloat(averageRating)));

    const countEl = document.getElementById("total-reviews-count");
    if (countEl) countEl.textContent = `Based on ${totalReviews} Reviews`;

    const overallText = document.getElementById("overall-rating-text");
    if (overallText) overallText.innerHTML = `${getStarsHTML(Math.round(parseFloat(averageRating)))} <span class="rating-text">(${totalReviews} Reviews)</span>`;

    // Render bar charts
    for (let i = 5; i >= 1; i--) {
        const count = starCounts[i] || 0;
        const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        const barFill = document.getElementById(`rating-bar-fill-${i}`);
        if (barFill) {
            barFill.style.width = `${pct}%`;
        }
    }

    if (filteredReviews.length === 0) {
        listEl.innerHTML = `<div class="empty-cart-msg">No reviews found matching this filter.</div>`;
        return;
    }

    filteredReviews.forEach(rev => {
        const card = document.createElement("div");
        card.className = "review-card";
        card.innerHTML = `
            <div class="review-card-header">
                <div class="user-profile">
                    <div class="user-avatar">${rev.author.charAt(0).toUpperCase()}</div>
                    <div class="user-info">
                        <h4>${rev.author}</h4>
                        <span>${rev.date}</span>
                    </div>
                </div>
                <div class="stars">${getStarsHTML(rev.rating)}</div>
            </div>
            <div class="review-card-content">
                ${rev.content}
            </div>
        `;
        listEl.appendChild(card);
    });
}

function getStarsHTML(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="ri-star-fill"></i>';
        } else {
            stars += '<i class="ri-star-line"></i>';
        }
    }
    return stars;
}

/* ==========================================================================
   5. Toast Notifications
   ========================================================================== */
function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <i class="ri-checkbox-circle-line"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("show");
    }, 50);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}
