// src/components/Signature.tsx
import { createSignal, onCleanup, onMount } from 'solid-js';

export function Signature() {
    let canvasRef: HTMLCanvasElement | undefined;
    let context: CanvasRenderingContext2D | null = null;
    let isDrawing = false;
    const [signatureImage, setSignatureImage] = createSignal<null | string>(null);
    const [isEditing, setIsEditing] = createSignal(false);

    const initializeCanvas = () => {
        if (canvasRef) {
            context = canvasRef.getContext('2d');
            if (context) {
                context.strokeStyle = 'black';
                context.lineWidth = 2;
                context.lineCap = 'round'; // Make the line round at the ends to avoid spaces
            }

            canvasRef.addEventListener('mousedown', startDrawing);
            canvasRef.addEventListener('mousemove', draw);
            canvasRef.addEventListener('mouseup', stopDrawing);
            canvasRef.addEventListener('mouseout', stopDrawing);
        }
    };

    const cleanupCanvas = () => {
        if (canvasRef) {
            canvasRef.removeEventListener('mousedown', startDrawing);
            canvasRef.removeEventListener('mousemove', draw);
            canvasRef.removeEventListener('mouseup', stopDrawing);
            canvasRef.removeEventListener('mouseout', stopDrawing);
        }
    };

    const startDrawing = (event: MouseEvent) => {
        if (!canvasRef) return;
        isDrawing = true;
        context?.beginPath();
        context?.moveTo(event.offsetX, event.offsetY);
    };

    const draw = (event: MouseEvent) => {
        if (!isDrawing || !context) return;
        context.lineTo(event.offsetX, event.offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        isDrawing = false;
        context?.closePath();
    };

    const clearCanvas = () => {
        if (!canvasRef) return;
        context?.clearRect(0, 0, canvasRef.width, canvasRef.height);
    };

    const submitSignature = () => {
        if (!canvasRef) return;
        const dataURL = canvasRef.toDataURL('image/png');
        setSignatureImage(dataURL);
        setIsEditing(false);
    };

    const editSignature = () => {
        setIsEditing(true);
        initializeCanvas();
    };

    onMount(() => {
        initializeCanvas();
    });

    onCleanup(() => {
        cleanupCanvas();
    });

    return (
        <div class="bg:white padding:1rem border:1px border:solid border:#d1d5db shadow:0|2px|4px|rgba(0,0,0,0.1) rounded:0.5rem width:24rem margin:0">
            <h2 class="font-size:1.25rem font-weight:700 margin-bottom:1rem">E-Signature</h2>
            {signatureImage() && !isEditing() ? (
                <div class="position:relative">
                    <img alt="Signature" class="border:1px border:solid border:#d1d5db rounded:0.5rem width:100%" src={signatureImage()!} />
                    <button class="position:absolute top:0 right:0 bg:white border:none cursor:pointer" onClick={editSignature}>
                        <svg class="width:1.5rem height:1.5rem color:#1d4ed8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.232 5.232l3.536 3.536m-2.036-4.036a2.5 2.5 0 113.536 3.536l-12 12a2 2 0 01-.879.515l-4 1a1 1 0 01-1.265-1.265l1-4a2 2 0 01.515-.879l12-12z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                        </svg>
                    </button>
                </div>
            ) : (
                <>
                    <p class="color:#6b7280 margin-bottom:1rem">Sign in the canvas below and save your signature as an image!</p>
                    <canvas class="border:1px border:dashed border:#d1d5db rounded:0.5rem width:100% height:10rem" ref={canvasRef} />
                    <div class="margin-top:1rem display:flex justify-content:space-between">
                        <button class="bg:#1d4ed8 color:white padding:0.5rem|1rem border:none rounded:0.25rem cursor:pointer" onClick={submitSignature}>Submit Signature</button>
                        <button class="bg:#ffffff border:1px border:solid border:#d1d5db color:#1d4ed8 padding:0.5rem|1rem rounded:0.25rem cursor:pointer" onClick={clearCanvas}>Clear Signature</button>
                    </div>
                </>
            )}
        </div>
    );
}
