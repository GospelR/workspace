//variables

const cartBtn = document.querySelector('#cart-icon');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const checkOutBtn = document.querySelector('.check-out');
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay")
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const dogsDOM = document.querySelector('.pro-container');






//cart
let cart = [];

//buttons
let buttonsDOM = [];
//getting the dogs
class Dogs {
    async getDogs() {
    
      try {
        let result = await fetch ('dog90.json')
        let data = await result.json();
        let dogs = data.items;
        dogs = dogs.map(item =>{
            const {title,price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {title, price, id, image}
        })
        return dogs
      } catch (error) {
        console.log(error);
      }  
      
     }
    }

//display dogs
class UI{
    displayDogs(dogs){
        let result = '';
        dogs.forEach(dog => {
            result +=` <div class="pro">
            <img src="${dog.image}" alt="">
            <div class="des">
                <span>English</span>
                <h5 class="dogName">${dog.title}</h5>
                <button class="bag-btn" data-id="${dog.id}">
                <i class="fa fa-shopping-cart"></i>
                add to cart
            </button>
                <h4 id="sum-prices">&#8358;${dog.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
            </div>
            
        </div>`; 
    });
    dogsDOM.innerHTML = result;

    }
    getBagButtons(){
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true
            }
            
                button.addEventListener('click', (event) => {
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;
                    //get dog from dogs
                    let cartItem = { ...Storage.getDog(id), amount: 1 };
                    //add dog to the cart
                    cart = [...cart, cartItem];
                    
                    //save cart in local storage
                    Storage.saveCart(cart);
                    //set cart values
                    this.setCartValues(cart);
                    //display cart item
                    this.addCartItem(cartItem);
                    //show the cart
                    this.showCart();
                });
            });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item){
       const div = document.createElement('div');
       div.classList.add('cart-item');
       div.innerHTML = `<img src=${item.image} alt="dog"  class="cart-img" height="140px" width="140px">
    <div>
        <h5>${item.title}</h5>
        <h4>&#8358;${item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
        <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
        <i class="fa fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        
        <i class="fa fa-chevron-down" data-id=${item.id}></i>
    </div>`;
    cartContent.appendChild(div);
    
    
    }
    showCart(){
      cartOverlay.classList.add('transparentBcg');
      cartDOM.classList.add("showCart");
    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart){
        cart.forEach(item =>this.addCartItem(item));
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        //clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        //cart functionality
        cartContent.addEventListener('click', event =>{
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                Storage.saveCart(cart);
                this.setCartValues(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
            }
        });
    }
    clearCart(){
      let cartItems = cart.map(item => item.id);
      cartItems.forEach(id => this.removeItem(id));
      console.log(cartContent.children);

      while (cartContent.children.length > 0){
        cartContent.removeChild(cartContent.children[0])
      }
      this.hideCart();
    }
    removeItem(id){
      cart = cart.filter(item => item.id !== id);
      this.setCartValues(cart);
      Storage.saveCart(cart);
      let button = this.getSingleButton(id);
      button.disabled = false;
      button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}





//local storage
class Storage{
    static saveDogs(dogs){
        localStorage.setItem("dogs", JSON.stringify(dogs));
    }
    static getDog(id){
        let dogs = JSON.parse(localStorage.getItem("dogs"));
        return dogs.find(dog => dog.id === id);
    }
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart))

    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];

    }
}



document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const dogs = new Dogs();
   
//setup app
ui.setupAPP();


//get all dogs
dogs
.getDogs()
.then(dogs => {
    ui.displayDogs(dogs);
    Storage.saveDogs(dogs);}).then(()=>{
    ui.getBagButtons();
    ui.cartLogic();
    });
});




/*displayDogs(dogs){
    
    });
}*/