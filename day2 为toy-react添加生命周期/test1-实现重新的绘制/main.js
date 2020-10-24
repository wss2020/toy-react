/**
    完成基于 range 的 Dom 绘制之后，考虑如何去实现重新的绘制，特别一提，这个重新绘制，对于我们的下一个步骤，
 就是我们的虚拟 Dom 也是至关重要的，如果没有重新绘制的话，其实也没有虚拟 Dom 什么事了，如果它只是绘制一遍的
 话，其实它不存在虚实Dom 比对的事情，所以说我们接下来的改造，就是要给组件加入这种，重新绘制和渲染的能力。
 */


import {createElement,Component,render} from "./toy-react.js";
/**
    接下来我们就尝试写一个 this.state的a,每次加1,然后让span再去重新渲染能够更新的这样的一个例子,
 这个children 什么的，我们就都不要了，不画这个 children 了， 我们写个 button ，给它一个onclick方法，这个方法
 里面，我们去写上 this.state.a 自增，这个呢，还不够，我们还需要让它调用一下 this.rerender , 这样理论上讲，它就
 应该去重新更新了，那么，但是 onclick 在这里面还不会生效，我们还要在 toy-react.js 里面，把 onclick 的逻辑给它
 补上。
 **/
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


