import {createElement,Component,render} from "./toy-react.js";

// 给我们的 Mycomponent 一个 render 接口，可以让它去 return 一个 JSX 这个样子，那么我们先不考虑 MyComponent 怎么样去封装，
// 我们先把 wrapper 给大家去做好。
// 如果要实现一个 main.js 里面的 MyComponent , 它同样也要具备这三个方法，
// 如果 Mycomponent 不想改变 setAttribute、appendChild ，那么我们给它设置默认行为，我们让它继承一个 Component 对象，
class Mycomponent extends Component{
    // 接下来我们想要实现 toy react ，就把下面屏蔽的三个写法，在 toy-react.js 里面去实现，
    // constructor() {
    //
    // }
    // setAttribute(name, value) {
    //
    // }
    // appendChild(component) {
    //
    // }

    // 我们是需要一种机制去展示它的 children 的，所以在上面的 Mycomponent 里面
    // render 里面 return 一个   {this.children} ，
    // 在  {this.children} 这里传进来的是一个数组，也就是说，传进来的时候，它并没有
    // 把 this.children 给它展开，而是把它直接作为一个数组，给它传入了，所以说我们
    // 在 createElement 里面去进行处理。
    render(){
        return <div>
              <h1>my component</h1>
              {this.children}
        </div>
    }
}

//最后我们的 render 也要进行修改，我们最后不能用 append ，
// 应该用一个 render 方法，
// 这里 Mycomponent 是有 children 的，这些 children 怎么展示出来呢？
// 我们是需要一种机制去展示它的 children 的，所以在上面的 Mycomponent 里面
render(
        <Mycomponent  id='a'  class='c' >
             <div>111</div>
             <div>222</div>
             <div>333</div>
             <div>444</div>
        </Mycomponent>
,document.body);


//1121

// render(
//         <Mycomponent id="a" class="c" >
//              <div class="div">   abc    </div>
//              <p   class="p">     111</p>
//             <span class="span">   222</span>
//         </Mycomponent>
// ,document.body);


