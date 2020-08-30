import {createElement,Component,render} from "./toy-react.js";

// 接下来我们就尝试写一个 this.state的a,每次加1。
// 然后让span再去重新渲染能够更新的这样的一个例子
class Mycomponent extends Component{
    constructor(){
        super();
        this.state ={
            a:1,
            b:2
        }
    }
    render(){
        return <div>
              <h1>my component sss</h1>

            // 这样写，理论上讲，它应该去更新了，但onclick 在这里面还不会生效
            // toy-react.js 中，把onclick 的逻辑补上。
             <button onclick={()=>{ this.state.a ++; this.rerender(); }}>add</button>

              <span> {this.state.a.toString()} </span>

             // 尝试写一个 this.state的a,每次加1。 就不画这个children了
             //  {this.children}
        </div>
    }
}


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


