class NumbersGame {
    constructor(matrix, state) {
	this.matrix = matrix;
        // this.matrix = cartanMatrix(algebra);

        var graphData = matrixToGraph(this.matrix);
        this.nodes = new vis.DataSet(graphData.nodes);
        this.edges = new vis.DataSet(graphData.edges);

        this.state = state;
    }

    fireNode(firedIdx) {
        var firedPopulation = this.state[firedIdx];
        if (firedPopulation >= 0) {
            return;
        }
        var nextState = Array.from(this.state, (x, toIdx) => (x - this.matrix[firedIdx][toIdx] * firedPopulation));

        this.state = nextState;
    }

    render(container) {
        var graphData = {nodes: this.nodes, edges: this.edges};
        var network = new vis.Network(container, graphData, {});
        for (var nodeIdx = 0; nodeIdx < this.state.length; nodeIdx++) {
            this.nodes.update({id: nodeIdx, label: this.state[nodeIdx].toString()});
        }

        var game = this;
        network.on("click", function (params) {
            if (params.nodes.length > 0) {
                game.fireNode(params.nodes[0]);

                for (var nodeIdx = 0; nodeIdx < game.state.length; nodeIdx++) {
                    var newProps = {
                        id: nodeIdx,
                        label: game.state[nodeIdx].toString()
                    };
                    game.nodes.update(newProps);
                }
            }
        });


        var networkOptions = {
            height: '250px',
            nodes: {
                borderWidth: 1,
                color: {
                    border: 'black',
                    background: 'white',
                    highlight: {
                        border: 'black',
                        background: 'white'
                    }
                },
                fixed: true,        // Disable physics simulation.
                shape: 'circle',
                font: {
                    face: 'Computer Modern Serif'
                }
            },
            edges: {
                smooth: true,      // Draw edges as straight lines.
                width: 1.5
            },
            physics: {
                enabled: false
            },
            interaction: {
                dragView: false,   // Disable scrolling
                zoomView: false    // Disable zooming
            }
        };

        network.setOptions(networkOptions);

        return network;
    }
}

function cyclicNumbersGame(length, state, container) {
    var matrix = tridiagonalMatrix(length, [-1, 2, -1]);
    matrix[0][length-1] = -1;
    matrix[length-1][0] = -1;

    var ng = new NumbersGame(matrix, state);
    var r = 100;
    for (var nodeIdx = 0; nodeIdx < length; nodeIdx++) {
        var theta = 2 * Math.PI / length * nodeIdx;
        ng.nodes.update({id: nodeIdx, x: r * Math.cos(theta), y: r * Math.sin(theta)});
    }

    var network = ng.render(container);
    network.setOptions( {height: '100%', width: '100%'} );

    return network;
}

function dynkinNumbersGame(algebra, state, container) {
    var ng = new NumbersGame(cartanMatrix(algebra), state);
    var network = ng.render(container);
    network.setOptions( {layout: {hierarchical: {enabled: true, direction: 'LR'}}} );
    return network;
}

function isSquare(matrix) {
    var rows = matrix.length;
    for (var i = 0; i < rows; i++) {
        if (matrix[i].length != rows) {
            return false;
        }
    }
    return true;
}

function edgeLabel(entry, transpose_entry) {
    // I wrote this sloppily on purpose in case it needs to be refactored later. -S
    var scale = null;
    var image = null;
    if (entry == -2) {
        scale = -1;
        image = "img/arrowhead-2.png";
    } else if (entry == -3) {
        scale = -1;
        image = "img/arrowhead-3.png";
    } else if (transpose_entry == -2) {
        scale = 1;
        image = "img/arrowhead-2.png";
    } else if (transpose_entry == -3) {
        scale = 1;
        image = "img/arrowhead-3.png";
    }

    var arrows = {
        middle: {
            enabled: true,
            scaleFactor: scale,
            type: 'image',
            src: image,
            imageHeight: 20,
            imageWidth: 20
        }
    };

    return arrows;
}

function matrixToGraph(matrix) {
    if (!isSquare(matrix)) {
        throw "Cannot form graph from nonsquare matrix.";
    }
    var nodes = Array.from(matrix, (x, i) => ({id: i, label: "Node " + i}));
    var edges = [];
    for (var from = 0; from < matrix.length; from++) {
        for (var to = from; to < matrix[from].length; to++ ) {
            var entry = matrix[from][to];
            var transpose_entry = matrix[to][from];

            // We can be assured that these will always be both zero or both negative for
            // Cartan matrices, but it doesn't hurt to make absolutely sure
            if (entry < 0 && transpose_entry < 0) {
                var edgeData = {
                    from: from,
                    to: to,
                    arrows: edgeLabel(entry, transpose_entry)
                }
                edges.push(edgeData);
                // edges.push({from: from, to: to, amplitude: -1 * entry, reverseAmplitude: -1 * transpose_entry});
            }
        }
    }
    var graphData = {nodes: nodes, edges: edges};
    return graphData;
}

function tridiagonalMatrix(rank, coeffs) {
    // Generate a grid of size `rank`.
    var matrix = [...Array(rank)].map(e => Array(rank).fill(0));

    var [upper, middle, lower] = coeffs;

    for (var i = 0; i < rank; i++) {
        if (i - 1 >= 0) { matrix[i][i - 1] = lower; }
        matrix[i][i] = middle;
        if (i + 1 < rank) { matrix[i][i + 1] = upper; }
    }

    return matrix;
}

function parseLieAlgebra(algebra) {
    // Return if `algebra` corresponds to a Cartan matrix.
    // TODO: Should we bother to handle the exceptional overlaps? (E3, etc.)
   
    const regex = /([ABCDEFG])(\d+)/i;

    const groups = regex.exec(algebra);

    var valid = false;
    if (groups !== null) {
        var type = groups[1];
        var rank = Number(groups[2]);

        switch (type) {
        case "A":
            valid = (rank >= 1);
            break;
        case "B":
            valid = (rank >= 2);
            break;
        case "C":
            valid = (rank >= 3);
            break;
        case "D":
            valid = (rank >= 4);
            break;
        case "E":
            valid = (6 <= rank <= 8);
            break;
        case "F":
            valid = (rank == 4);
            break;
        case "G":
            valid = (rank == 2);
            break;
        }
    }
    if (valid) {
        return [type, rank];
    } else {
        throw "invalid algebra: " + algebra;
    }
}

function cartanMatrix(algebra) {
    // Return the Cartan matrix corresponding to the given string as an array of arrays.
    // Cf. Humphreys page 59.

    var [type, rank] = parseLieAlgebra(algebra);

    var matrix = tridiagonalMatrix(rank, [-1, 2, -1]);
    switch (type) {
    case "A":
        break;
    case "B":
        matrix[rank - 2][rank - 1] = -2;
        break;
    case "C":
        matrix[rank - 1][rank - 2] = -2;
        break;
    case "D":
        matrix[rank - 3][rank - 1] = -1;
        matrix[rank - 2][rank - 1] = 0;
        matrix[rank - 1][rank - 2] = 0;
        matrix[rank - 1][rank - 3] = -1;
        break;
    case "E":
        matrix[0][1] = 0;
        matrix[0][2] = -1;
        matrix[1][0] = 0;
        matrix[1][2] = 0
        matrix[1][3] = -1;
        matrix[2][0] = -1;
        matrix[2][1] = 0;
        matrix[3][1] = -1;
        break;
    case "F":
        matrix[1][2] = -2;
        break;
    case "G":
        matrix[1][0] = -3;
        break;
    }

    return matrix;
}
