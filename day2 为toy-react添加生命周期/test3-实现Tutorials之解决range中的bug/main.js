
import {createElement, Component, render} from "./toy-react.js";

/**
    这个版本结束，range 的小 bug 结束了，但是我们用的 React 的版本，还没有交换 player 的逻辑，
 那么用一个它的最终版本的 Code .
 **/

/**    range.setStart(startNode,2);
 要注意我们的写法有一些细小的不同，这个是我们故意的，因为我们现在比较新，有很多
 新特性都出来了，比如说用这个对象做命名空间的做法，现在看来已经是一种落后的做法了，
 所以我们把这个 extends 直接写上，这就删掉，
 render 直接render
 React 是推荐用两行空格做缩进，我是比较喜欢用四个空格做缩进，所以我们给它格式化一下。
 **/
class Square extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }

    render() {
        return (
            <button
                className="square"
                onClick={() => this.setState({value: 'X'})}
            >
                {this.state.value}
            </button>
        );
    }
}

class Board extends Component {
    renderSquare(i) {
        return <Square />;
    }

    render() {
        const status = 'Next player: X';

        return (
            <div>
                <div className="status">{status}</div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
                <div className="game-info">
                    <div>{/* status */}</div>
                    <ol>{/* TODO */}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

render(
    <Game />,
    document.getElementById('root')
);
