// ================= LOGIN =================
function login(){
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let error = document.getElementById("errorMsg");

    if(email === "" || password === ""){
        if(error) error.innerText = "Please enter Email and Password";
        return;
    }

    localStorage.setItem("isLoggedIn","true");
    localStorage.setItem("userEmail", email);

    window.location.href = "index.html";
}

// ================= ADD TO CART =================
function addToCart(name, price){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ name: name, price: Number(price) });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Item added to cart ✅");
}

// ================= LOAD CART =================
function loadCart(){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let container = document.getElementById("cartItems");

    if(!container) return;
    container.innerHTML = "";

    if(cart.length === 0){
        container.innerHTML = "<h3>Your Cart is Empty</h3>";
        return;
    }

    let total = 0;
    cart.forEach(item => {
        if(!item.name || !item.price) return;
        total += Number(item.price);

        container.innerHTML += `
            <div class="cart-item">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
            </div>
        `;
    });

    container.innerHTML += `
        <h3>Total: ₹${total}</h3>
        <br>
        <a href="checkout.html" class="btn">Continue</a>
    `;
}

// ================= CONFIRM ORDER =================
async function confirmOrder(){
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let mobile = document.getElementById("mobile").value;
    let address = document.getElementById("address").value;
    let payment = document.getElementById("payment").value;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if(cart.length === 0){
        alert("Cart is empty!");
        return;
    }

    let total = cart.reduce((sum,i)=> sum + Number(i.price),0);

    // Save order in localStorage
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let order = {
        id: "ORD" + Math.floor(Math.random()*10000),
        items: cart,
        name, email, mobile, address, payment, total,
        status: "Ordered",
        time: new Date().toLocaleTimeString()
    };
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Send to backend (MongoDB + Gmail)
    try{
        let response = await fetch("http://localhost:5000/place-order",{
            method:"POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        });
        let data = await response.json();
        if(data.success){
            alert("🎉 Order Placed Successfully!"); // popup
            localStorage.removeItem("cart");
            window.location.href = "orders.html"; // redirect
        }
    }catch(err){
        alert("Server not running ⚠");
    }
}

// ================= LOAD ORDERS + DELIVERY PROGRESS =================
async function loadOrders(){
    let container = document.getElementById("ordersList");
    if(!container) return;

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    if(window.location.pathname.includes("orders.html")){
        container.innerHTML = "";
        if(orders.length === 0){
            container.innerHTML = "<h3>No orders yet</h3>";
            return;
        }

        orders.forEach((order,index)=>{
            let itemsHTML = order.items.map(i=> `<li>${i.name} - ₹${i.price}</li>`).join("");

            container.innerHTML += `
            <div class="order-card">
                <h4>Order ID: ${order.id}</h4>
                <p>Name: ${order.name}</p>
                <p>Email: ${order.email}</p>
                <p>Mobile: ${order.mobile}</p>
                <p>Address: ${order.address}</p>
                <p>Payment: ${order.payment}</p>
                <ul>${itemsHTML}</ul>
                <p>Total: ₹${order.total}</p>
                <p>Status: <span id="status${index}">${order.status}</span></p>
                <div class="progress-bar">
                    <div id="progress${index}" class="progress"></div>
                </div>
                <p>Time: ${order.time}</p>
            </div>
            `;

            simulateProgress(index);
        });
    }
}

// ================= SIMULATE DELIVERY PROGRESS =================
function simulateProgress(index){
    let steps = ["Ordered","Packed","Out for Delivery","Delivered"];
    let progress = 0;
    let stepIndex = 0;

    let interval = setInterval(()=>{
        if(stepIndex < steps.length){
            document.getElementById("status"+index).innerText = steps[stepIndex];
            document.getElementById("progress"+index).style.width = progress + "%";
            progress += 25;
            stepIndex++;
        } else {
            clearInterval(interval);
        }
    }, 2000);
}

// ================= AUTO LOAD =================
document.addEventListener("DOMContentLoaded", function(){
    if(window.location.pathname.includes("cart.html")) loadCart();
    if(window.location.pathname.includes("orders.html")) loadOrders();
});