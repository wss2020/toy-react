// 接下来，实现react的这个 Tutorials, 也就是 React 教程里面的Demo 尝试去跑起来

import {createElement,Component,render} from "./toy-react.js";


//fdsf

class Square extends Component {
    // TODO: remove the constructor
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }

    render() {
        // TODO: use onClick={this.props.onClick}
        // TODO: replace this.state.value with this.props.value
        return (
            <button className="square" onClick={() => this.setState({value: 'X'})}>
        {this.state.value}
    </button>
    );
    }
}

class Board extends Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
        };
    }

    renderSquare(i) {
        return <Square value={this.state.squares[i]} />;
    }

    render() {
        const status = 'Next player: X';

        return (
            <div>
            <div className="status">{status}</div>
            <div className="board-row">
            {this.renderSquare(0)}{this.renderSquare(1)}{this.renderSquare(2)}
    </div>
        <div className="board-row">
            {this.renderSquare(3)}{this.renderSquare(4)}{this.renderSquare(5)}
    </div>
        <div className="board-row">
            {this.renderSquare(6)}{this.renderSquare(7)}{this.renderSquare(8)}
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
