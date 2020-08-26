// 这里创建两个类的作用，只是为了，下一步做铺垫。 实际中，不写更好。
class Elementwrapper{
    constructor(type){
        this.root = document.createElement(type);
    }

    setAttribute(name,value){
        this.root.setAttribute(name,value);
    }
    appendChild(component) {
        this.root.appendChild(component.root);
    }
}

class TextWrapper{
    constructor(content){
        this.root = document.createTextNode(content);
    }
}



export function createElement(type,attributes,...children){
    // let e =  document.createElement(type);
    let e =  new Elementwrapper(type,attributes);

    for(let p in attributes){
        // e.setAttribute(p,attributes[p]);
        e.setAttribute(p,p,attributes[p])
    }
    for(let child of children){
        if(typeof child === 'string'){
            // child = document.createTextNode(child);
            child = new TextWrapper(child);
        }
        e.appendChild(child);
    }

    return e;
}


export function render(component,parentElement) {
    parentElement.appendChild(component.root);
}

