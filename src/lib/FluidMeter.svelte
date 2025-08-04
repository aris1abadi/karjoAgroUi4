<script>
    import { onMount } from 'svelte';
    import * as FluidMeterModule from 'fluid-meter'; // Import sebagai modul CommonJS
    const FluidMeter = FluidMeterModule.default;     // Ambil default export-nya
  
    export let percentage = 50;
  
    let container;
    let meter;
  
    onMount(() => {
      if (!FluidMeter || typeof window === 'undefined') return;
  
      meter = new FluidMeter();
      meter.init({
        targetContainer: container,
        fillPercentage: percentage,
        options: {
          fontSize: '70px',
          fontFamily: 'Arial',
          fontFillStyle: 'white',
          drawPercentageSign: true,
          drawBubbles: true,
          size: 300,
          borderWidth: 25,
          backgroundColor: '#e2e2e2',
          foregroundColor: '#fafafa',
          foregroundFluidLayer: {
            fillStyle: 'purple',
            angularSpeed: 100,
            maxAmplitude: 12,
            frequency: 30,
            horizontalSpeed: -150
          },
          backgroundFluidLayer: {
            fillStyle: 'blue',
            angularSpeed: 100,
            maxAmplitude: 9,
            frequency: 30,
            horizontalSpeed: 150
          }
        }
      });
    });
  
    // Update jika percentage berubah
    $: if (meter && typeof percentage === 'number') {
      meter.setPercentage(percentage);
    }
  </script>
  
  <div bind:this={container}></div>
  