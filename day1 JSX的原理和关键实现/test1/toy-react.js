/**
 我们先把 wrapper 给大家去做好。
    通常 wrapper 没有必要去 export 出来，我们给一个 class Elementwrapper，然后我们再创建一个 TextWrapper ，
 而我们实际上最后产生的，因为都是我们自己定义的 class ，所以说最后我们的 render 也要进行修改，我们最后不能用 append ，
 Elementwrapper 和 TextWrapper ，根据我们的 createElement 函数里面的实现，我们都有一个 constructor ,一个
 setAttribute , 还有一个 appendChild ;
    根据上一步创建的代码， createTextNode 的时候，我们也需要知道内容。

 **/
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

/**
 我们需要包装的其实只有方法，一个是 appendChild ,当然我们还需要两个 create ,其实我们需要两个包装类型，
    一个是 createElement , 一个是 createTextNode ,然后我们希望它的接口能跟我们的 MyComponent 一致，而我们的MyComponent
 我们会给它一个 render 接口，
 **/
export function createElement(type,attributes,...children){
    // let e =  document.createElement(type);
    let e =  new Elementwrapper(type,attributes);

    for(let p in attributes){
        // e.setAttribute(p,attributes[p]);
        e.setAttribute(p,attributes[p])
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


// 这里 export 一个 render 方法出来，
export function render(component,parentElement) {
    parentElement.appendChild(component.root);
}

