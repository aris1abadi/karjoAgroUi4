<script>
	import { Button, Modal, Spinner, Tabs, TabItem, Toggle } from 'flowbite-svelte';

	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import RangeSlider from 'svelte-range-slider-pips';

	import {
		myTask,
		kirimMsg,
		flowAPersen,
		flowBPersen,
		flowCPersen,
		taskMode,
		bleConnectionToggle,
		bleIsConnected,
		mqttConnectionToggle,
		mqttIsConnected,
		networkMode,
		networkSelect,
		getLocalStatus,
		kontrolID,
		networkSetup,
		msgType,
		spinnerShow,
		modalMode,
		isStarted,
		displayMode,
		nodeType,
		aktuatorList,
		sensorHumidityList,
		sensorTemperatureList,
		sensorIntermittentList,
		sensorLengasList,
		isDemo,
		demoWait,
		connectionStatus,
		mqttDisconnect,
		bleDisconnect,
		display
	} from '$lib/stores';

	let defaultModal = false;
	let myTaskNow = null;

	let batasBawahValue = 30;
	let batasAtasValue = 32;
	let minSpinner = 10;
	let maxSpinner = 100;
	let volume = 80;

	let aktuator1Select = 0;
	let aktuator2Select = 0;
	let aktuatorMixASelect = 0;
	let aktuatorMixBSelect = 0;
	let aktuatorMixCSelect = 0;
	let aktuatorAdukSelect = 0;
	let aktuatorMixOutSelect = 0;
	let targetAValue = 0;
	let targetBValue = 0;
	let targetCValue = 0;

	let kontrolSelect = 0;
	let displayModeSelect = 0;

	let sensorSelect = 0;
	let sensorList = [
		{
			nodeId: '----',
			sensorType: nodeType.NODE_DISTANCE,
			val: 0,
			isActive: false
		},
		{
			nodeId: '----',
			sensorType: nodeType.NODE_DISTANCE,
			val: 0,
			isActive: false
		}
	];
	let displayList = ['MODE_BAR1', 'MODE_BAR2','MODE_BAR3', 'MODE_ANGKA'];
	let setupTitle = 'Setup';

	// @ts-ignore
	let lastMsg = null;

	let lastDemo = $isDemo;
	let demoVal = lastDemo;
	let newKkontrol = false;

	// @ts-ignore
	let header = 'Temperature';
	const myKontrolID = get(kontrolID);
	let inputID = myKontrolID;

	// Gunakan onMount agar manipulasi DOM hanya terjadi di client-side
	onMount(() => {
		// Inisialisasi MQTT hanya jika belum ada koneksi
		/*
		mqttClient.subscribe((client) => {
			if (!client) {
				initMqtt(); // Koneksi pertama kali
			}
		});
		const unsubscribe = mqttData.subscribe((data) => {
			cekMqttMsg(data); // Panggil fungsi untuk memperbarui sensorData
		});
		openFullscreen();

		// Unsubscribe ketika komponen dibongkar
		return () => {
			unsubscribe();
		};
		*/
		//untuk internal litleFS
		//$networkMode = networkSelect.MODE_LOCAL

		$flowAPersen = 0;
		$flowBPersen = 0;
		$flowCPersen = 0;
		//
		//setTimeout(getTask, 1000);
		//setTimeout(openFullscreen, 3000);
		//if ($networkMode === networkSelect.MODE_LOCAL) {
		//	setTimeout(getNetwork, 1000);
		//	setInterval(getLocalStatus, 2000);
		//}
	});

	// @ts-ignore

	const serverList = ['server1', 'server2', 'server3'];

	const kontrolList = ['KONTROL1','KONTROL2','KONTROL3','KONTROL4','KONTROL5']
	const modeList = [
		'Mode Temperature',
		'Mode Humidity',
		'Mode Lengas',
		'Mode intermittent',
		'Mode Mix'
	];
	let rangeValue = [20, 80];

	let setupIndex = 0;
	let setupMode = $modalMode.SET_TASK; //0 mode set task,1 mode set device,3 mode alert
	/*
	function openFullscreen() {
		const element = document.documentElement;
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}
		*/

	function getTask() {
		kirimMsg(msgType.KONTROL, 0, 'getAllTask', '1');
	}

	function getNetwork() {
		kirimMsg(msgType.KONTROL, 0, 'getNetwork', '1');
	}
	// @ts-ignore
	function enableClick(idx) {
		const lastEnableStatus = $myTask[idx].enable;
		if ($myTask[idx].enable == 0) {
			$myTask[idx].enable = 1;
		} else {
			$myTask[idx].enable = 0;
		}
		$spinnerShow[idx] = true;
		setTimeout(() => ($spinnerShow[idx] = false), 3000);

		if (!kirimMsg(msgType.TASK, idx, 'enable', String($myTask[idx].enable))) {
			$myTask[idx].enable = lastEnableStatus;
		}
	}

	function tambahKontrol() {
		defaultModal = true;
		newKkontrol = true;
		setupTitle = 'Tambah Kontrol';
		modeSelect = taskMode.MODE_INTERMITTEN;
		namaSelect = 'Intermitten';

		//alert($myTask[idx].nama)
		//set pilih aktuator sesai data
		aktuator1Select = 0;
		aktuator2Select = 1;

		targetAValue = 100;
		targetBValue = 100;
		targetCValue = 100;
		rangeValue[0] = -5;
		rangeValue[1] = 0;

		// sensorList = sensorTemperatureList
		if (modeSelect === taskMode.MODE_TEMPERATURE) {
			sensorList = sensorTemperatureList;
			sensorSelect = 0;
			minSpinner = 10;
			maxSpinner = 100;
		} else if (modeSelect === taskMode.MODE_HUMIDITY) {
			sensorList = sensorHumidityList;
			sensorSelect = 0;
			minSpinner = 10;
			maxSpinner = 100;
		} else if (modeSelect === taskMode.MODE_LENGAS) {
			sensorList = sensorLengasList;
			sensorSelect = 0;
			minSpinner = 10;
			maxSpinner = 100;
		} else if (modeSelect === taskMode.MODE_INTERMITTEN) {
			sensorList = sensorIntermittentList;
			sensorSelect = 0;

			minSpinner = -10;
			maxSpinner = 10;
		}
	}

	// @ts-ignore
	export function setupClick(idx, mode) {
		defaultModal = true;
		newKkontrol = false;
		setupIndex = idx;
		setupMode = mode;
		//load aktuator
		//kirimMsg(msgType.KONTROL, setupIndex, 'getAllAktuator', '1');

		if (mode === $modalMode.SET_TASK) {
			setupTitle = 'Setup Auto' + $myTask[idx].nama;
			modeSelect = $myTask[idx].mode;
			namaSelect = $myTask[idx].nama;
			//alert($myTask[idx].nama)
			//set pilih aktuator sesai data
			aktuator1Select = $myTask[idx].aktuator1 - 1;
			aktuator2Select = $myTask[idx].aktuator2 - 1;

			targetAValue = $myTask[idx].targetMixA * 100;
			targetBValue = $myTask[idx].targetMixB * 100;
			targetCValue = $myTask[idx].targetMixC * 100;
			rangeValue[0] = $myTask[idx].batasBawah;
			rangeValue[1] = $myTask[idx].batasAtas;

			// sensorList = sensorTemperatureList
			if ($myTask[idx].mode === taskMode.MODE_TEMPERATURE) {
				sensorList = sensorTemperatureList;
				//batasBawahValue = $myTask[idx].batasBawah;
				//batasAtasValue = $myTask[idx].batasAtas;
				sensorSelect = $myTask[idx].sensorUse - 1;
				minSpinner = 10;
				maxSpinner = 100;
			} else if ($myTask[idx].mode === taskMode.MODE_HUMIDITY) {
				sensorList = sensorHumidityList;
				sensorSelect = $myTask[idx].sensorUse - 1;
				//batasBawahValue = $myTask[idx].batasBawah;
				//batasAtasValue = $myTask[idx].batasAtas;
				minSpinner = 10;
				maxSpinner = 100;
			} else if ($myTask[idx].mode === taskMode.MODE_LENGAS) {
				sensorList = sensorLengasList;
				sensorSelect = $myTask[idx].sensorUse - 1;
				//batasBawahValue = $myTask[idx].batasBawah;
				//batasAtasValue = $myTask[idx].batasAtas;
				minSpinner = 10;
				maxSpinner = 100;
			} else if ($myTask[idx].mode === taskMode.MODE_INTERMITTEN) {
				sensorList = sensorIntermittentList;
				sensorSelect = $myTask[idx].sensorUse - 1;
				//batasBawahValue = $myTask[idx].batasBawah - 15;
				//batasAtasValue = $myTask[idx].batasAtas - 15;
				minSpinner = -10;
				maxSpinner = 10;
			}
		} else if (mode === $modalMode.SET_DEVICE) {
			//mode setup device
			setupTitle = 'Kontrol ' + $kontrolID;
		}
	}

	function aktuatorSelect_click(num = 1) {
		const tp = 'auto' + $myTask[setupIndex].nama;

		if (num == 1) {
			$myTask[setupIndex].aktuator1 = aktuator1Select + 1;
			//alert("pilih aktuator1 " + (aktuator1Select + 1));
		} else if (num == 2) {
			$myTask[setupIndex].aktuator2 = aktuator2Select + 1;
			//alert("pilih aktuator2 " + (aktuator2Select + 1));
		}
	}
	function sensorSelect_click() {
		const tp = 'auto' + $myTask[setupIndex].nama;

		if ($myTask[setupIndex].mode === taskMode.MODE_TEMPERATURE) {
			$myTask[setupIndex].sensorUse = sensorSelect + 1;
		} else if ($myTask[setupIndex].mode === taskMode.MODE_HUMIDITY) {
			$myTask[setupIndex].sensorUse = sensorSelect + 1;
		} else if ($myTask[setupIndex].mode === taskMode.MODE_LENGAS) {
			$myTask[setupIndex].sensorUse = sensorSelect + 1;
		} else if ($myTask[setupIndex].mode === taskMode.MODE_INTERMITTEN) {
			$myTask[setupIndex].sensorUse = sensorSelect + 1;
		}

		//alert("sensor temperture select: " + sensorSelect + 1);
	}
	let modeSelect = 0;
	let namaSelect = '';

	function modeSelect_click() {
		const tp = 'auto' + $myTask[setupIndex].nama;

		$myTask[setupIndex].mode = modeSelect;

		// sensorList = sensorTemperatureList
		if (modeSelect === taskMode.MODE_TEMPERATURE) {
			sensorList = sensorTemperatureList;
			//batasBawahValue = $myTask[setupIndex].batasBawah;
			//batasAtasValue = $myTask[setupIndex].batasAtas;
			rangeValue[0] = $myTask[setupIndex].batasBawah;
			rangeValue[1] = $myTask[setupIndex].batasAtas;

			sensorSelect = $myTask[setupIndex].sensorUse - 1;
			minSpinner = 10;
			maxSpinner = 100;
			namaSelect = 'Temperature';
		} else if (modeSelect === taskMode.MODE_HUMIDITY) {
			sensorList = sensorHumidityList;
			//batasBawahValue = $myTask[setupIndex].batasBawah;
			//batasAtasValue = $myTask[setupIndex].batasAtas;
			rangeValue[0] = $myTask[setupIndex].batasBawah;
			rangeValue[1] = $myTask[setupIndex].batasAtas;
			sensorSelect = $myTask[setupIndex].sensorUse - 1;
			minSpinner = 10;
			maxSpinner = 100;
			namaSelect = 'Humidity';
		} else if (modeSelect === taskMode.MODE_LENGAS) {
			sensorList = sensorLengasList;
			//batasBawahValue = $myTask[setupIndex].batasBawah;
			//batasAtasValue = $myTask[setupIndex].batasAtas;
			rangeValue[0] = $myTask[setupIndex].batasBawah;
			rangeValue[1] = $myTask[setupIndex].batasAtas;
			sensorSelect = $myTask[setupIndex].sensorUse - 1;
			minSpinner = 10;
			maxSpinner = 100;
			namaSelect = 'Lengas';
		} else if (modeSelect === taskMode.MODE_INTERMITTEN) {
			sensorList = sensorIntermittentList;
			//batasBawahValue = $myTask[setupIndex].batasBawah - 15;
			//batasAtasValue = $myTask[setupIndex].batasAtas - 15;
			rangeValue[0] = $myTask[setupIndex].batasBawah;
			rangeValue[1] = $myTask[setupIndex].batasAtas;
			sensorSelect = $myTask[setupIndex].sensorUse - 1;
			minSpinner = -10;
			maxSpinner = 10;
			namaSelect = 'Intermittent';
		}
		setupTitle = 'Setup Auto' + namaSelect;

		console.log('rangeValue: ' + rangeValue);
	}

	let serverSelect = 0;

	function serverSelectChange() {
		console.log('Server select: ' + serverList[serverSelect]);
	}

	function batasBawahChange() {
		const tp = 'auto' + $myTask[setupIndex].nama;
		/*
		if ($myTask[setupIndex].mode === taskMode.MODE_INTERMITTEN) {
			$myTask[setupIndex].batasBawah = batasBawahValue + 15;
		} else {
			$myTask[setupIndex].batasBawah = batasBawahValue;
		}
			*/
		$myTask[setupIndex].batasBawah = batasBawahValue;
		rangeValue[0] = batasBawahValue;

		//alert("Target bawah: " + batasBawahValue);
	}

	function batasAtasChange() {
		const tp = 'auto' + $myTask[setupIndex].nama;
		/*
		if ($myTask[setupIndex].mode === taskMode.MODE_INTERMITTEN) {
			$myTask[setupIndex].batasAtas = batasAtasValue + 15;
		} else {
			$myTask[setupIndex].batasAtas = batasAtasValue;
		}
			*/
		$myTask[setupIndex].batasAtas = batasAtasValue;
		rangeValue[1] = batasAtasValue;

		//alert("Target atas: " + batasAtasValue);
	}
	function rangeChange() {
		$myTask[setupIndex].batasBawah = rangeValue[0];
		$myTask[setupIndex].batasAtas = rangeValue[1];
	}

	function mapClamp(x) {
		const in_min = -10;
		const in_max = 10;
		const out_min = 100;
		const out_max = 0;
		// Clamp input
		if (x < in_min) x = in_min;
		if (x > in_max) x = in_max;

		// Mapping
		return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	}

	function targetAValue_change() {
		const tp = 'auto' + $myTask[setupIndex].nama;
		$myTask[setupIndex].targetMixA = targetAValue / 100;
		//alert(
		//	"Target " +
		//		$myTask[setupIndex].mixANama +
		//		":" +
		//		targetAValue +
		//		"mL",
		//);
	}

	function targetBValue_change() {
		const tp = 'auto' + $myTask[setupIndex].nama;

		$myTask[setupIndex].targetMixB = targetBValue / 100;
		/*
		alert(
			"Target " +
				$myTask[setupIndex].mixBNama +
				":" +
				targetBValue +
				"mL",
		);
		**/
	}

	function targetCValue_change() {
		const tp = 'auto' + $myTask[setupIndex].nama;

		$myTask[setupIndex].targetMixC = targetCValue / 100;

		/*alert(
			"Target " +
				$myTask[setupIndex].mixCNama +
				":" +
				targetCValue +
				"mL",
		);*/
	}

	function mixAClick() {
		//alert("nama MixA click");
	}

	function updateDisplayClick(){
		if(kontrolSelect > $myTask.length){
			alert("kontrol tidak ditemukan")
		}else{
			let display_msg = String(kontrolSelect) + ','+ String(displayModeSelect) + ',-,'
			kirimMsg(msgType.KONTROL, 0, 'setDisplay', display_msg);
			console.log("update display " + display_msg);
		}
	}

	function simpanTask() {
		if (setupMode === 0) {
			$myTask[setupIndex].nama = namaSelect;
			$myTask[setupIndex].mode = modeSelect;

			$myTask[setupIndex].sensorUse = sensorSelect + 1;
			if (newKkontrol) {
				kirimMsg(msgType.TASK, setupIndex, 'addTask', JSON.stringify($myTask[setupIndex]));
			} else {
				kirimMsg(msgType.TASK, setupIndex, 'updateTask', JSON.stringify($myTask[setupIndex]));
			}
			//console.log('Update Task: ' + JSON.stringify($myTask[setupIndex]));
		} else {
			//simpan
			if ($networkMode === networkSelect.MODE_LOCAL || $networkMode === networkSelect.MODE_BT) {
				kirimMsg(msgType.KONTROL, 0, 'updateServer', JSON.stringify($networkSetup));
			} else {
				//simpan kontrol id
				kontrolID.set(inputID);
			}
		}
		defaultModal = false;
	}

	let onlineCheck = false;

	function networkChange() {
		console.log('online check ' + onlineCheck);
		if (onlineCheck) {
			$networkSetup.mode = false;
		} else {
			$networkSetup.mode = true;
		}
	}

	function demoChange() {
		//console.log($isDemo)

		$demoWait = true;
		setTimeout(() => {
			$demoWait = false;
			demoVal = lastDemo;
		}, 5000);

		let demomsg = '0';
		if (demoVal) {
			demomsg = '1';
			lastDemo = true;
		} else {
			lastDemo = false;
		}
		kirimMsg(msgType.KONTROL, 0, 'demoMode', demomsg);
	}

	function exitPage() {
		$isStarted = false;
		mqttDisconnect();
		bleDisconnect();
	}

	//update myTask
	// $: myTask = myTask
</script>

<svelte:head>
	<title>KarjoAgro</title>
	<meta name="description" content="karjoAgro kontrol" />
</svelte:head>

{#if !$isStarted}
	<div class="mx-auto w-full max-w-md px-4">
		<Button
			color="light"
			class="col-span-3 mt-24 h-20 w-full"
			on:click={() => mqttConnectionToggle()}
		>
			Sambung ke jaringan
		</Button>

		<Button color="blue" class="col-span-3 mt-8 h-20 w-full" on:click={() => bleConnectionToggle()}>
			Sambung ke Local
		</Button>

		<Button
			class="col-span-3 mt-8 h-20 w-full"
			on:click={() => setupClick(1, $modalMode.SET_DEVICE)}
		>
			Setup {$kontrolID}
		</Button>
	</div>
{:else}
	<div class="mx-auto w-full max-w-md p-4">
		<!--Header-->
		<div class="text-center text-sm">karjoAgro</div>
		<div class="text-center font-mono text-4xl font-bold text-white">Agro Kontrol</div>
		<div class="mb-8 mt-2 flex justify-center">
			<div
				class={$connectionStatus
					? 'grid w-1/2 grid-cols-4  bg-white p-1 text-center text-xs font-bold text-lime-600'
					: 'grid w-1/2 grid-cols-4  bg-white p-1 text-center text-xs font-bold text-red-600'}
			>
				<div class="col-span-3">
					{$kontrolID}
					{#if $connectionStatus}
						Online
					{:else}
						Offline
					{/if}
				</div>
				<div class="flex justify-center">
					<img class="mr-2 h-4 w-4" src={$bleIsConnected ? 'bt2.png' : 'bt1.png'} alt="connectBT" />
					<img
						class="h-4 w-4"
						src={$mqttIsConnected ? 'wifi.png' : 'no-wifi.png'}
						alt="conectNetwork"
					/>
				</div>
			</div>
		</div>
		<div class="no-select h-100 no-scrollbar grid w-full grid-cols-2 gap-8 overflow-y-scroll">
			{#each $myTask as dataShow, idx}
				<div class="h-42 col-span-2 w-full rounded-lg bg-white p-0 shadow">
					<button
						class={dataShow.enable == 0
							? 'font-monospace mt-0 h-8 w-full  bg-red-500 text-center text-sm font-bold text-white '
							: 'font-monospace mt-0 h-8 w-full  bg-green-500 text-center text-sm font-bold text-white '}
						on:click={() => enableClick(idx)}
					>
						{#if $spinnerShow[idx]}
							<Spinner class="me-3" bg="white" size="5" color="yellow" />
						{/if}

						Auto{dataShow.nama}
					</button>

					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="h-24 w-full justify-items-center"
						on:dblclick={() => setupClick(idx, $modalMode.SET_TASK)}
					>
						{#if dataShow.mode === taskMode.MODE_INTERMITTEN}
							<div class="mt-2 grid h-24 w-full grid-cols-3 place-items-center gap-2">
								<div class="flex h-3/4 w-full justify-center">
									<div class="h-full w-6 rounded-full bg-indigo-700">
										<div
											class="w-6 rounded-full rounded-b-none bg-gray-200"
											style="height: {mapClamp(dataShow.sensorVal)}%;"
										></div>
									</div>
								</div>

								<div class="col-span-2">
									<div class=" w-full content-center text-center font-mono text-4xl font-bold">
										{dataShow.sensorVal}<small><small> cm</small></small>
									</div>
									<div style="font-size: x-small;text-align:center">
										ON:{dataShow.batasBawah} ~ OFF:{dataShow.batasAtas}
									</div>
									<div style="font-size:xx-small;" class="text-center">
										lastSeen: {dataShow.lastSeen}
									</div>
								</div>
							</div>
						{:else if dataShow.mode === taskMode.MODE_MIX}
							<div class="flex h-full w-full justify-center">
								<div class="mt-2 h-full w-5/6">
									<!-- Mix A-->
									<div class="mb-2 grid grid-cols-6">
										<div class="col-span-2 text-left text-xs font-bold">
											{dataShow.mixAnama}
										</div>
										<div class="col-span-3 h-4 rounded-full bg-gray-200">
											<div
												class="h-4 rounded-full bg-blue-600"
												style="width: {$flowAPersen}%;"
											></div>
										</div>
										<div class="pl-2 text-left text-xs font-bold">
											{dataShow.targetMixA * 100}mL
										</div>
									</div>

									<!-- Mix B-->
									<div class="mb-2 grid grid-cols-6">
										<div class="col-span-2 text-left text-xs font-bold">
											{dataShow.mixBnama}
										</div>
										<div class="col-span-3 h-4 rounded-full bg-gray-200">
											<div
												class="h-4 rounded-full bg-blue-600"
												style="width: {$flowBPersen}%;"
											></div>
										</div>
										<div class="pl-2 text-left text-xs font-bold">
											{dataShow.targetMixB * 100}mL
										</div>
									</div>

									<!-- Mix C-->
									<div class="grid grid-cols-6">
										<div class="col-span-2 text-left text-xs font-bold">
											{dataShow.mixCnama}
										</div>
										<div class="col-span-3 h-4 rounded-full bg-gray-200">
											<div
												class="h-4 rounded-full bg-blue-600"
												style="width: {$flowCPersen}%;"
											></div>
										</div>
										<div class="pl-2 text-left text-xs font-bold">
											{dataShow.targetMixC * 100}mL
										</div>
									</div>
									<div class="text-xs">
										Aduk({dataShow.mixingTarget}detik)
									</div>
								</div>
							</div>
						{:else}
							<div class="mt-4 text-center font-mono text-4xl font-bold">
								{dataShow.sensorVal}{#if dataShow.mode === taskMode.MODE_HUMIDITY}%
								{:else if dataShow.mode === taskMode.MODE_TEMPERATURE}&deg;C
								{:else if dataShow.mode === taskMode.MODE_LENGAS}<small>%</small>
								{/if}
							</div>

							<div class="mt-4 h-4 text-center font-mono text-xs">
								{#if dataShow.mode === taskMode.MODE_HUMIDITY}
									ON:{dataShow.batasBawah} ~ OFF:{dataShow.batasAtas}
								{:else if dataShow.mode === taskMode.MODE_TEMPERATURE}
									OFF:{dataShow.batasBawah} ~ ON:{dataShow.batasAtas}
								{:else if dataShow.mode === taskMode.MODE_LENGAS}
									ON:{dataShow.batasBawah} ~ OFF:{dataShow.batasAtas}
								{/if}
							</div>
							<div style="font-size: xx-small; text-align:center;">
								lastSeen: {dataShow.lastSeen}
							</div>
						{/if}
					</div>
				</div>
			{/each}
			<div class="h-42 col-span-2 w-full rounded-lg bg-white p-0 shadow">
				<button
					class="font-monospace mt-0 h-8 w-full bg-red-500 text-center text-sm font-bold text-white"
				>
					Tambah Kontrol
				</button>

				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<button
					class="h-24 w-full justify-items-center text-center text-9xl font-bold"
					on:dblclick={() => tambahKontrol()}
					>+
				</button>
			</div>
		</div>

		<footer class="mt-4">
			{#if $networkMode != networkSelect.MODE_LOCAL}
				<div class="grid grid h-10 w-1/2 grid-cols-2 justify-items-center bg-green-100">
					<button on:click={() => exitPage()} class="h-8"
						><img class="h-6 w-6" src="exit.png" alt="Keluar" /></button
					>
					<div>
						<button on:click={() => setupClick(1, $modalMode.SET_DEVICE)} class="h-8">
							<img class="h-6 w-6" src="setup2.png" alt="Setup" /></button
						>
					</div>
				</div>
			{:else}
				<div>
					<button on:click={() => setupClick(1, $modalMode.SET_DEVICE)} class="justify-center">
						<img class="h-8 w-8" src="setup2.png" alt="Setup" /></button
					>
				</div>
			{/if}
			<p></p>

			<p class="mt-2 text-xs">agro kontrol by karjoAgro</p>
		</footer>
	</div>
{/if}
<Modal class="h-full w-full" title={setupTitle} bind:open={defaultModal}>
	{#if setupMode === 0}
		<div class="mx-auto grid max-w-sm grid-cols-2 gap-2">
			<div class="col-span-2">
				<label for="pilihMode" class="mb-1 block text-xs dark:text-white">Pilih Mode</label>
				<select
					id="pilihSensor"
					bind:value={modeSelect}
					on:change={() => modeSelect_click()}
					class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
				>
					{#each modeList as mode, idx}
						<option value={idx}>{mode}</option>
					{/each}
				</select>
			</div>

			<div class="col-span-2">
				<label for="NamaTask" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					>Nama</label
				>
				<input
					type="text"
					id="namatask"
					bind:value={namaSelect}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					placeholder={$myTask[setupIndex].nama}
					required
				/>
			</div>

			{#if $myTask[setupIndex].mode === taskMode.MODE_MIX}
				<div class="col-span-2 ml-4">
					<label for="targetA" class="mb-1 block text-xs dark:text-white"
						>Target {$myTask[setupIndex].mixAnama}
						{targetAValue}mL</label
					>
					<span
						><input
							id="targetA"
							type="range"
							min="100"
							max="1000"
							step="100"
							bind:value={targetAValue}
							class="mb-6 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
							on:change={targetAValue_change}
						/>
					</span>
				</div>

				<div class="col-span-2 ml-4">
					<label for="targetB" class="mb-1 block text-xs dark:text-white"
						>Target {$myTask[setupIndex].mixBnama}
						{targetBValue}mL</label
					>
					<span>
						<input
							id="targetB"
							type="range"
							min="100"
							max="1000"
							step="100"
							bind:value={targetBValue}
							class="mb-6 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
							on:change={targetBValue_change}
						/>
					</span>
				</div>

				<div class="col-span-2 ml-4">
					<label for="targetC" class="mb-1 block text-xs dark:text-white"
						>Target {$myTask[setupIndex].mixCnama}
						{targetCValue}mL</label
					>
					<span>
						<input
							id="targetC"
							bind:value={targetCValue}
							type="range"
							min="100"
							max="2000"
							step="100"
							class="mb-6 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
							on:change={targetCValue_change}
						/>
					</span>
				</div>

				<div>
					<label for="namaMixA" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
						>Nama MixA</label
					>
					<input
						type="text"
						id="namaMixA"
						on:mouseenter={() => mixAClick()}
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder={$myTask[setupIndex].mixAnama}
						required
					/>
				</div>

				<div>
					<label for="namaMixB" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
						>Nama MixB</label
					>
					<input
						type="text"
						id="namaMixB"
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder={$myTask[setupIndex].mixBnama}
						required
					/>
				</div>
			{:else}
				<div>
					<label for="small1" class="mb-1 block text-xs dark:text-white">Pilih Aktuator1</label>
					<select
						bind:value={aktuator1Select}
						on:change={() => aktuatorSelect_click(1)}
						id="small1"
						class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>Aktuator({aktuator.nodeId}-{aktuator.nomerAktuator - 5})</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="small2" class="mb-1 block text-xs">Pilih Aktuator2</label>
					<select
						bind:value={aktuator2Select}
						on:change={() => aktuatorSelect_click(2)}
						id="small2"
						class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>Aktuator({aktuator.nodeId}-{aktuator.nomerAktuator - 5})</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>

		{#if $myTask[setupIndex].mode === taskMode.MODE_MIX}
			<div></div>
		{:else}
			<div class="my-0">
				<label for="pilihSensor" class="mb-1 block text-xs dark:text-white">Pilih Sensor</label>
				<select
					id="pilihSensor"
					bind:value={sensorSelect}
					on:change={() => sensorSelect_click()}
					class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
				>
					{#each sensorList as sensor, idx}
						<option value={idx}>
							{#if sensor.sensorType === nodeType.NODE_TEMPERATURE}
								Sensor Temperature {idx + 1} ({sensor.nodeId})
							{:else if sensor.sensorType === nodeType.NODE_HUMIDITY}
								Sensor Humidity {idx + 1} ({sensor.nodeId})
							{:else if sensor.sensorType === nodeType.NODE_SOIL_MOISTURE}
								Sensor Lengas {idx + 1} ({sensor.nodeId})
							{:else if sensor.sensorType === nodeType.NODE_DISTANCE}
								Sensor Intermittent {idx + 1} ({sensor.nodeId})
							{/if}
						</option>
					{/each}
				</select>
			</div>
			<div class="mt-2 rounded-sm border border-gray-200 dark:border-gray-700">
				<div class="mt-2 grid grid-cols-2 justify-items-center">
					{#if $myTask[setupIndex].mode == taskMode.MODE_TEMPERATURE}
						<div>OFF({rangeValue[0]})</div>
						<div>ON({rangeValue[1]})</div>
					{:else}
						<div>ON({rangeValue[0]})</div>
						<div>OFF({rangeValue[1]})</div>
					{/if}
				</div>

				<RangeSlider
					range
					pips
					min={minSpinner}
					max={maxSpinner}
					on:change={() => rangeChange()}
					bind:values={rangeValue}
				/>
			</div>
		{/if}
		<div class="grid h-10 w-3/4 grid-cols-3 gap-4 pl-4">
			<Button color="red" on:click={() => (defaultModal = false)}>Keluar</Button>
			<Button color="green" on:click={() => simpanTask()}>Simpan</Button>
		</div>
	{:else}
		<Tabs tabStyle="underline">
			{#if $isStarted}
				<TabItem open title="Setup">
					<div class="h-80 w-full overflow-auto">
						<!--for setupkontroller network-->
						<div class="mx-auto grid max-w-sm grid-cols-2 gap-4">
							{#if $networkMode === networkSelect.MODE_BT}
								<div class="col-span-2">
									<input
										id="checked-checkbox"
										type="checkbox"
										on:change={() => networkChange()}
										bind:checked={onlineCheck}
										class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
									/>
									<label
										for="checked-checkbox"
										class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
										>Online Mode</label
									>
								</div>

								<div class="col-span-2">Wifi Setup</div>
								<input
									type="text"
									id="ssid"
									bind:value={$networkSetup.ssid}
									class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
									placeholder="SSID"
									required
								/>

								<input
									type="password"
									id="password"
									bind:value={$networkSetup.password}
									class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
									placeholder="Password"
									required
								/>
							{:else}
								<div class="col-span-2 grid h-12 w-full grid-cols-2 gap-4 rounded border p-2">
									<input
										type="text"
										bind:value={inputID}
										class=" h-8 w-full border-none bg-gray-50 text-sm text-gray-900"
										placeholder={$kontrolID}
										required
									/>
									<Button class="h-8 w-full" color="green" on:click={() => simpanTask()}
										>Simpan</Button
									>
								</div>
								{#if $isStarted}
								<div class="col-span-2 grid h-40 w-full grid-cols-2 gap-4 rounded border p-2">
								<div>
									<label for="disp1" class="mb-1 block text-xs dark:text-white">Display</label>
									<select
										bind:value={kontrolSelect}										
										id="disk1"
										class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
									>
										{#each kontrolList as kontrol, idx}
											<option value={idx}>{kontrol}</option>
										{/each}
									</select>
								</div>
								<div>
									<label for="disk2" class="mb-1 block text-xs">Mode</label>
									<select										
										id="disk2"
										bind:value={displayModeSelect}
										class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
									>
										{#each displayList as display, idx}
											<option value={idx}>{display}</option>
										{/each}
									</select>
								</div>
								<Button on:click={() => updateDisplayClick()} class="col-span-2">Update Display</Button>
								</div>
									<div class="center col-span-2 h-12 w-full rounded border px-8 py-2">
										<Toggle bind:checked={demoVal} on:change={() => demoChange()}
											>Demo
											{#if $demoWait}
												<Spinner class="me-3" bg="white" size="5" color="yellow" />
											{/if}
										</Toggle>
									</div>
								{/if}
							{/if}
						</div>
					</div>
				</TabItem>
				<TabItem title="Aktuator">
					<div class="h-60 w-full overflow-auto">
						{#each aktuatorList as aktuator, idx}
							<div class="mb-4 grid h-16 w-full grid-cols-3 rounded border p-2">
								<button class="textsm col-span-2 ml-2 text-left font-bold"
									>Aktuator{idx + 1}
									<div class="text-xs font-extralight">
										NodeId: {aktuator.nodeId} Aktuator: {aktuator.nomerAktuator - 5}
									</div></button
								>
								<button class="text-sm font-bold"
									>{#if aktuator.val === 1}
										ON
									{:else}
										OFF
									{/if}</button
								>
							</div>
						{/each}
					</div>
				</TabItem>
				<TabItem title="Sensor">
					<div class="no-scrollbar h-60 w-full overflow-auto">
						{#each sensorTemperatureList as sensor, idx}
							<div class="mb-4 grid h-14 w-full grid-cols-3 rounded border">
								<button class="col-span-2 ml-2 text-left text-sm font-bold"
									>SensorTemperature{idx + 1}
									<div class="text-xs font-extralight">
										NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
									</div></button
								>
								<div class="mt-2 text-center font-bold">{sensor.val}°C</div>
							</div>
						{/each}
						<hr class="mb-4" />
						{#each sensorHumidityList as sensor, idx}
							<div class="mb-4 grid h-14 w-full grid-cols-3 rounded border">
								<button class="col-span-2 ml-2 text-left text-sm font-bold"
									>SensorHumidity{idx + 1}
									<div class="text-xs font-extralight">
										NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
									</div></button
								>
								<div class="mt-2 text-center font-bold">{sensor.val}%</div>
							</div>
						{/each}
						<hr class="mb-4" />
						{#each sensorLengasList as sensor, idx}
							<div class="mb-4 grid h-14 w-full grid-cols-3 rounded border">
								<button class="col-span-2 ml-2 text-left text-sm font-bold"
									>SensorLengas{idx + 1}
									<div class="text-xs font-extralight">
										NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
									</div></button
								>
								<div class="mt-2 text-center font-bold">{sensor.val}%</div>
							</div>
						{/each}
						<hr class="mb-4" />
						{#each sensorIntermittentList as sensor, idx}
							<div class="mb-4 grid h-14 w-full grid-cols-3 rounded border">
								<button class="col-span-2 ml-2 text-left text-sm font-bold"
									>SensorIntermittent{idx + 1}
									<div class="text-xs font-extralight">
										NodeId: {sensor.nodeId} Batt:{sensor.battLevel}%
									</div></button
								>
								<div class="mt-2 text-center font-bold">{sensor.val}Cm</div>
							</div>
						{/each}
						<hr class="mb-4" />
					</div>
				</TabItem>
			{:else}
				<TabItem open title="Setup">
					<div class="h-60 w-full overflow-auto">
						<!--for setupkontroller network-->
						<div class="mx-auto grid max-w-sm grid-cols-2 gap-4">
							{#if $networkMode === networkSelect.MODE_BT}
								<div class="col-span-2">
									<input
										id="checked-checkbox"
										type="checkbox"
										on:change={() => networkChange()}
										bind:checked={onlineCheck}
										class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
									/>
									<label
										for="checked-checkbox"
										class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
										>Online Mode</label
									>
								</div>

								<div class="col-span-2">Wifi Setup</div>
								<input
									type="text"
									id="ssid"
									bind:value={$networkSetup.ssid}
									class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
									placeholder="SSID"
									required
								/>

								<input
									type="password"
									id="password"
									bind:value={$networkSetup.password}
									class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
									placeholder="Password"
									required
								/>
							{:else}
								<input
									type="text"
									bind:value={inputID}
									class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
									placeholder={$kontrolID}
									required
								/>
								<Button color="green" on:click={() => simpanTask()}>Simpan</Button>
								<div class="col-span-2"></div>
								{#if $isStarted}
									<Toggle bind:checked={demoVal} on:change={() => demoChange()}
										>Demo
										{#if $demoWait}
											<Spinner class="me-3 ml-2" bg="white" size="5" color="yellow" />
										{/if}
									</Toggle>
								{/if}
							{/if}
						</div>
					</div>
				</TabItem>
			{/if}
		</Tabs>
	{/if}
</Modal>

<style lang="postcss">
	@reference "tailwindcss";
	:global(html) {
		width: 100%; /* Lebar elemen 100% dari lebar kontainer */
		height: 100%; /* Tinggi elemen */
		background-image: url('/tumbuh1.jpeg'); /* URL gambar */
		background-size: cover; /* Sesuaikan gambar agar menutupi elemen */
		background-position: center; /* Pusatkan gambar */

		background-repeat: no-repeat; /* Jangan ulangi gambar */
	}
	section {
		display: flex;
		flex-direction: column;
		justify-content: top;
		max-width: max-w-64;
		align-items: top;
		flex: 0.6;
		margin-top: 16px;
		margin-left: 24px;
		margin-right: 24px;
	}
	.no-select {
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
	.rangePips :is(.in-range, .selected) {
		background: #f00;
		width: 2px;
	}
</style>
