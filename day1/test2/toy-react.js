
/**
    我们有一个简单的策略，就是我们把我们要创建的实体的 DOM ，那么我们就放到一个属性上，constructor 的时候我们创建这个 root ,然后在
 setAttribute 的时候，我们就直接把它代理到 root 上， appendChild 的时候，我们需要做一些特殊的处理，那么我们也可以把它的 root 取
 出来，给它加上去，它传进来的是一个 component ,而这个 appendChild 它是一个 component 和 component 之间的 appendChild ,所以
 说我们要把 component 的 root 给它取出来，
 */
class ElementWrapper{
    constructor(type){
        this.root = document.createElement(type);
    }

    setAttribute(name,value){
        this.root.setAttribute(name,value);
    }
    appendChild(component) {
    // 这里有一个重要隐藏的 API ,我们 appendChild 的时候，用了一个 root ，
    // ElementWrapper 和 TextWrapper 都是有 root 的，但是 Component 的 root
    // 我们必须要取出来，所以看 Component 哪里，我们需要让它调一下 render ,
        this.root.appendChild(component.root);
    }
}

/**
    TextWrapper 是没有 setAttribute 的，那么没有听说过文本节点还有属性，所以我们就给它 constructor 的时候，createTextNode(content)
 它也没有 appendChild ,它只会被 append 。
*/
class TextWrapper{
    constructor(content){
        this.root = document.createTextNode(content);
    }
}

/**
    Component 它在 constructor 的时候，不会做任何事情，我们就初始化一些变量，
 setAttribute 我们是需要把 attribute 给它存起来的，所以这里我们初始化的时候，
 this.props 我们把它等于一个空的对象，但是空对象又不够空，所以我们把它等于
 this.props  = Object.create(null);
    setAttribute 的时候，我们把它存到  this.props[name] 里面，
    appendChild 的时候，我们还需要有一个 this.children = [],把接收到的 component
 放到 this.children 里面。
 所以 Component 其实没有做什么事情。
 */
export class Component{
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
    }

    setAttribute(name,value) {
        this.props[name] = value;
    }

    appendChild(component) {
        this.children.push(component);
    }

    //Component 的root 我们必须要取出来，这里我们需要让它调一下 render ,
    // 所以这里给了一个 get root();  这是我们在 class 里面的 getter 的一个写法，
    // 那么这个root ,我们会用一个相对来说比较私有的这样的一个 root 去存，这个root 后面
    // 我们可能名字会做一些修改。
    //get root 就是我们真实的渲染过程，我们怎么做呢？
    //因为其实Component 我们是希望它像 React 那样调一个 render 方法，
    // 所以说没有 root 的话，我们会给它一个，让它做一次 render ,而 render 出来的东西，
    // 我们是希望它有 root 的，而这个地方非常的有意思，如果我们 render 出来的，仍然是一个
    // Component 的话，那么这个地方，就会发生一次 递归，一直到它变成一个ElementWrapper
    // 或者是一个 TextWrapper 为根结点的一个 Component .
    get root(){
        // 这里先用下划线，后面会教大家用更好的方法，
        if(!this._root){
            this._root = this.render().root;
        }
        return this._root;
    }
}


export function createElement(type,attributes,...children){
    let e;
    if(typeof  type === "string"){
        e = new ElementWrapper(type);
    }else{
        e = new type;
    }

    for(let p in attributes){
        e.setAttribute(p,attributes[p]);
    }

    let insertChildren = (children)=>{
        for(let child of children){
            if(typeof child === 'string'){
                child = new TextWrapper(child);
            }

            // 处理 自定义组件类 MyComponent 传进来的 this.children ,
            //如果 (typeof child === "object") && (child instanceof  Array)
            // 那么这个时候，我们就应该把它展开，但是我们考虑到有些时候，它这个数组里面还是有数组
            // 它其实是一个递归展开的过程，所以这里我们做成一个  insertChildren ，里面放一个
            // children ,然后我们把它写进 insertChild 里面， 然后我们去执行 insertChildren
            // 然后我们这里面，就可以递归的去调用了。
            // 我们就把 child 当做数组传进去，这里判断里面，我们加上了括号，本来是没有必要的，
            // 但是加上括号能让我们的代码的可读性提升。
            if( (typeof child === "object") && (child instanceof Array) ){
                insertChildren(child);
            }else{
                e.appendChild(child);
            }
        }
    };
    insertChildren(children);
    return e;
}


export function render(component,parentElement) {
    parentElement.appendChild(component.root);
}

// export function createElement(type,attributes,...children){
//     let e =  new Elementwrapper(type,attributes);
//
//     for(let p in attributes){
//         e.setAttribute(p,p,attributes[p])
//     }
//     for(let child of children){
//         if(typeof child === 'string'){
//             child = new TextWrapper(child);
//         }
//         e.appendChild(child);
//     }
//
//     return e;
// }
