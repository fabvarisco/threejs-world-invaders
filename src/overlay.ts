class Overlay {
    constructor() {
      const div = document.createElement("div");
      div.style.position = "absolute";
      div.textContent = "TESTE OVERLAY";
      div.style.zIndex = "10003";
      document.body.append(div);
    }
  
  
    update(){
  
    }
  
    public SetLife(){
    }
  
  
  }
  export default Overlay;