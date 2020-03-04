import makeRequest from "./util";
import { isNullOrUndefined } from "util";

/**
 * Initialize a shader program, so WebGL knows how to draw our data.
 */
export function initShaderProgram(
    gl: WebGL2RenderingContext,
    vsSource: string,
    fsSource: string,
): WebGLProgram {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource) as WebGLShader;
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource) as WebGLShader;

    // Create the shader program
    const shaderProgram = gl.createProgram();
    if (isNullOrUndefined(shaderProgram)) throw "Failed to create shader program";

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        const error = "Unable to initialize the shader program";
        alert(error + ": " + gl.getProgramInfoLog(shaderProgram));
        throw error;
    }

    return shaderProgram;
}

/**
 * Creates a shader of the given type, uploads the source and compiles it.
 */
function loadShader(
    gl: WebGL2RenderingContext,
    type: number,
    source: string,
): WebGLShader | null {
    const shader = gl.createShader(type);
    if (isNullOrUndefined(shader)) throw "Failed to create shader";

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = "An error occurred compiling the shaders";
        alert(error + ": " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

export async function bindTexture(url: string, gl: WebGL2RenderingContext): Promise<void> {
    const buffer = await makeRequest("GET", url, "arraybuffer") as ArrayBuffer;

    if (buffer) {
        const floatArray = new Int16Array(buffer);

        const width = floatArray[0];
        const height = floatArray[1];
        const depth = floatArray[2];
        console.log(width, height, depth);

        // Normalize
        console.log("Calculating max");
        let max = 0;
        for (let i = 0; i < floatArray.length; ++i) {
            max = Math.max(max, floatArray[i]);
        }
        console.log("Max is ", max);

        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_3D, texture);

        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        console.log("Transforming to float");
        const volumeData = new Float32Array(floatArray.slice(3));
        console.log("Success");

        for (let i = 0; i < volumeData.length; ++i) {
            volumeData[i] /= max;
        }
        //volumeData = volumeData.map(x=>x/max);
        gl.texImage3D(gl.TEXTURE_3D,
            0,
            gl.R16F,
            width,
            height,
            depth,
            0,
            gl.RED,
            gl.FLOAT,
            volumeData
        );
    }
}