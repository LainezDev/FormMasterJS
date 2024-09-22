function OnFailed(error) {
    alert(error.get_message());
};

function eliminarFila(spanElement) {
    if (spanElement) {
        let confirmacion = confirm('¿Está seguro de que deseas eliminar este documento?');
        if (confirmacion) {
            let fila = spanElement.parentElement.parentElement;
            fila.parentElement.deleteRow(fila.rowIndex);
        }
    }
};

function cargarDocumentos(documentosJson) {
    //console.log("JSON recibido:", documentosJson);
    const tableBody = document.querySelector(".todo__list");
    if (Object.keys(documentosJson).length > 0) {
        // Borrar filas de la tabla
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }

        // Recorrer cada documento en el JSON y agregarlo a la tabla
        documentosJson.forEach(doc => {
            const newRow = tableBody.insertRow();

            // Columna Documento
            const cellDocumento = newRow.insertCell(0);
            cellDocumento.textContent = doc.NombreDocumento;

            // Columna Original
            const cellOriginal = newRow.insertCell(1);
            const originalCheckbox = document.createElement('input');
            originalCheckbox.type = 'checkbox';
            //originalCheckbox.checked = doc.original;
            cellOriginal.appendChild(originalCheckbox);

            // Columna Sin Recibir
            const cellSinRecibir = newRow.insertCell(2);
            const sinRecibirCheckbox = document.createElement('input');
            sinRecibirCheckbox.type = 'checkbox';
            //sinRecibirCheckbox.checked = doc.sinrecibir;
            cellSinRecibir.appendChild(sinRecibirCheckbox);

            // Columna Requerido
            const cellRequerido = newRow.insertCell(3);
            const requeridoCheckbox = document.createElement('input');
            requeridoCheckbox.type = 'checkbox';
            //requeridoCheckbox.checked = doc.requerido;
            cellRequerido.appendChild(requeridoCheckbox);

            // Columna Nro. de Documento
            const cellNroDocumento = newRow.insertCell(4);
            const nroDocumentoInput = document.createElement('input');
            nroDocumentoInput.type = 'text';
            nroDocumentoInput.value = doc.NroDocumento;
            cellNroDocumento.appendChild(nroDocumentoInput);

            // Columna Fecha Documento
            const cellFechaDocumento = newRow.insertCell(5);
            const fechaDocumentoInput = document.createElement('input');
            fechaDocumentoInput.type = 'date';
            if (doc.Fecha !== "1900-01-01") {
                fechaDocumentoInput.value = doc.Fecha;
            }
            //fechaDocumentoInput.value = doc.Fecha;
            cellFechaDocumento.appendChild(fechaDocumentoInput);

            // Columna Fecha Recepción
            const cellFechaRecepcion = newRow.insertCell(6);
            const fechaRecepcionInput = document.createElement('input');
            fechaRecepcionInput.type = 'date';
            if (doc.fecharecepcion !== "1900-01-01") {
                fechaRecepcionInput.value = doc.fecharecepcion;
            }
            cellFechaRecepcion.appendChild(fechaRecepcionInput);

            // Columna Observaciones
            const cellObservaciones = newRow.insertCell(7);
            const observacionesInput = document.createElement('input');
            observacionesInput.type = 'text';
            observacionesInput.value = doc.Observaciones;
            cellObservaciones.appendChild(observacionesInput);

            // Columna Acciones
            const cellAcciones = newRow.insertCell(8);
            cellAcciones.innerHTML = '<span class="delete-btn" id="delete-' + doc.idDocumentosListaChequeo + '" >&times;</span>';
        });
    };
};

function construirJsonDeTabla() {
    const tabla = document.getElementById('checklistTable');
    const jsonData = [];
    const urlParams = new URLSearchParams(window.location.search);
    const idDO = urlParams.get('idDO');
    for (let i = 1; i < tabla.rows.length; i++) { // Empieza en 1 para saltar el header
        const fila = tabla.rows[i];
        let fechaDocumento = fila.cells[5].querySelector('input').value;
        let fechaRecepcion = fila.cells[6].querySelector('input').value;
        if (fechaDocumento === "") { fechaDocumento = '1900-01-01'; }
        if (fechaRecepcion === "") { fechaRecepcion = '1900-01-01'; }
        const filaData = {
            idDO: idDO, // O el id que tengas
            idDocumento: "6",
            idListaChequeoEncabezado: "1",
            NroDocumento: fila.cells[4].querySelector('input').value,
            original: fila.cells[1].querySelector('input').checked,
            sinrecibir: fila.cells[2].querySelector('input').checked,
            requerido: fila.cells[3].querySelector('input').checked,
            Observaciones: fila.cells[7].querySelector('input').value,
            Fecha: fechaDocumento,
            fecharecepcion: fechaRecepcion,
            NombreDocumento: fila.cells[0].innerText
        };
        jsonData.push(filaData);
    }

    return JSON.stringify(jsonData);
};

function guardarChecklist() {
    const urlParams = new URLSearchParams(window.location.search);
    const idDO = urlParams.get('idDO');
    if (idDO) {
        const jsonChecklist = construirJsonDeTabla();
        PageMethods.GuardarChecklist(jsonChecklist, idDO, onSuccess, onError);
    } else {
        alert("Debe guardar o seleccionar un D.O. antes de crear un checklist de documentos");
    }
};

function onSuccess(result) {
    alert(result);
};

function onError(error) {
    alert("Hubo un error al guardar el checklist: " + error);
};

function loadForm(configJson, GetFormData) {
    const formContainer = document.getElementById('form-container');
    const formGroup = document.createElement('form');
    const formName = 'form' + configJson.tablename;
    formGroup.id = formName;
    formGroup.action = configJson.formaction || '#';
    formGroup.method = configJson.formmethod || 'POST';
    formContainer.appendChild(formGroup);

    //tamaño del form
    principalDiv = document.getElementById("div-principal");
    const formSizeCss = getFormSizeCss(configJson.formsize);
    principalDiv.classList.add(formSizeCss);

	if (configJson.tabs) {
		generateTabs(configJson.tabs, formName, false);
	}
    addButtonClickSaveForm('formMasterSaveBtn', formName, configJson.tablename, configJson.fieldpk);
    generateForm(configJson, formName, false);
    clearFieldPkInSessionStorage(configJson.fieldpk)

    if (GetFormData) {
        fillFormData(GetFormData, configJson.tablename, configJson.fieldpk);
        fillFormDataTables(configJson.fields, GetFormData);
        if (configJson.tabs) {
            addParamsSrcIframesTabs(configJson.tabs, configJson.fieldpk);
        }
    }
    createDuplicateModal('form-container', configJson.fieldpk, configJson.duplicatewithchildren);    
    utilityActions.initButtons(configJson.utilityactions);
    window.addEventListener('beforeunload', function (e) {
        sessionStorage.removeItem(configJson.fieldpk);
    });

};
function fillFormData(data, tableName, fieldpk) {

    if (!data || Object.keys(data).length === 0) {
        showNotification('error', 'Error: No se ha proporcionado información en los datos. Si el error persiste, por favor contacte a soporte.');
        return;
    }

    var tableData = data[tableName];
    var record;
    if (!tableData || tableData.length === 0) {
        record = data;        
    } else  {
        record = tableData[0];
    } 
    const prefixID = tableName + '-';

    for (var key in record) {
        if (record.hasOwnProperty(key)) {
            const value = record[key];
            const findID = prefixID + key;

            
            if (fieldpk) {
                if (record[fieldpk] !== undefined && record[fieldpk] !== null) {
                    sessionStorage.setItem(fieldpk, record[fieldpk]);
                } else {
                    // Obtener el ID desde los parámetros de la URL si no está en el registro
                    const params = new URLSearchParams(window.location.search);
                    const id = params.get(fieldpk);
                    if (id !== null) {
                        sessionStorage.setItem(fieldpk, id);
                    }
                }
            }

            var element = document.getElementById(findID);

            if (element) {
                if (element.type === 'radio') {
                    // Para radio buttons, busca todos los elementos con el nombre común y marca el correcto
                    const radioButtons = document.getElementsByName(element.name);
                    for (var i = 0; i < radioButtons.length; i++) {
                        if (radioButtons[i].value === value) {
                            radioButtons[i].checked = true;
                            break; // Sale del bucle una vez que se encuentra y se marca el radio button correcto
                        }
                    }
                } else if (element.type === 'checkbox') {
                    // Para checkboxes, asigna el valor de 'checked'
                    element.checked = value;
                } else if (element.type === 'date') {
                    element.value = FormMasterDate(value, 'YYYY-MM-DD');
                } else {
                    if (value !== null && value !== undefined) {
                        element.value = value.toString();
                    } else {
                        element.value = ''; // O asigna un valor predeterminado si es necesario
                    }
                }
            } else if (element === null && key) {
                //const findID = prefixID + key;
                if (findID.includes(key)) {
                    const radioButtons = document.getElementsByName(findID);
                    radioButtons.forEach(radio => {                        
                        if (radio.value === value.toString()) {
                            radio.checked = true;
                        }
                    });
                }
            }
        }
    }
}


function fillFormDataTables(fields, GetFormData) {
    // Iterar sobre cada campo en el esquema de fields
    fields.forEach(field => {
        // Verificar si el tipo de campo es 'itemstable'
        if (field.fieldtype === 'itemstable') {
            // Buscar el conjunto de datos para este fieldname en GetFormData
            const tableData = GetFormData.itemstable.find(item => item.fieldname === field.fieldname);

            // Si se encuentra la tabla, generar la tabla con sus datos
            if (tableData && tableData.data) {
                GenerateTable(field.label, field.description, field.fieldname, field.columns, field.actions, tableData, field.pkfield, field.fkfield);
            } else {
                // Si no hay datos disponibles, mostrar un mensaje
                alert(`No hay datos disponibles para la tabla: ${field.fieldname}`);
            }
        }
        // No hacer nada si el tipo de campo no es 'itemstable'
    });
}



function generateTabs(jsonConfigTabs, DefaultFormID, isModalForm) {
	let idDefaulttab;
	const formContainer = document.getElementById('form-container');
	if (isModalForm === true) {
		DefaultFormID = 'form' + DefaultFormID;
	}
	
	const tabID = DefaultFormID + '-tab-content';
	const DivPrincipal = document.getElementById('div-principal');
	const DivTabsItemContainer = document.createElement('div');
	DivTabsItemContainer.id = 'DivTabsItemContainer';
	const DivTabsContent = document.createElement('div');
	DivTabsContent.id = tabID;
	DivTabsItemContainer.innerHTML = '';
	DivTabsContent.innerHTML = '';
	
	const ul = document.createElement('div');
	ul.className = 'flex flex-wrap -mb-px text-sm font-medium text-center';
	ul.id = DefaultFormID + '-ul-default-tab';
	ul.setAttribute('role', 'tablist');
	const ulDataTabsToggle = '#' + tabID;
	ul.setAttribute('data-tabs-toggle', ulDataTabsToggle);
	
	  // Crear el contenido de cada pestaña
	jsonConfigTabs.forEach(tab => {
		// Crear el botón de la pestaña
		const li = document.createElement('div');
		li.className = 'me-2';
		li.setAttribute('role', 'presentation');

		const button = document.createElement('button');
		button.className = 'inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300';
		button.id = `${tab.fieldname.replace(/\s+/g, '-')}-tab-btn`;
		button.setAttribute('data-tabs-target', `#${tab.fieldname.replace(/\s+/g, '-')}`);
		button.setAttribute('type', 'button');
		button.setAttribute('role', 'tab');
		button.setAttribute('aria-controls', tab.fieldname.replace(/\s+/g, '-'));
		button.setAttribute('aria-selected', 'false');
		button.textContent = tab.tabname;

		li.appendChild(button);
		ul.appendChild(li);

		// Crear el contenido de la pestaña
		const div = document.createElement('div');
		div.className = 'hidden p-4 rounded-lg dark:bg-gray-800';
		div.id = tab.fieldname.replace(/\s+/g, '-');
		div.setAttribute('role', 'tabpanel');
		div.setAttribute('aria-labelledby', button.id);
		
		if (tab.defaulttab === 1 && tab.type === 'form' && DefaultFormID !== '') {
			idDefaulttab = div.id;
		}
		
		if (tab.type === 'iframe') {
		  const iframe = document.createElement('iframe');
		  iframe.id = 'Iframe' + tab.fieldname;
		  iframe.style = 'width: 100%; height: 1000px;';
		  iframe.src = tab.src;
		  div.appendChild(iframe);
		}

		DivTabsContent.appendChild(div);
	  });
	  
	  DivTabsItemContainer.appendChild(ul);
	  DivPrincipal.appendChild(DivTabsItemContainer);
	  DivPrincipal.appendChild(DivTabsContent);
	  document.getElementById(idDefaulttab).appendChild(formContainer);
	
};

function generateForm(config, elementID, isModalForm) {
    //console.log("JSON recibido:", config);
    if (isModalForm === true) {
        elementID = 'form' + elementID;
    }
    const prefixID = config.tablename;
    const formContainer = document.getElementById(elementID);
    formContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos campos
    const formGroup = document.createElement('div');

    if (config.formcolumns && config.formcolumns > 0) {
        formGroup.className = 'grid gap-4 mb-4 sm:grid-cols-' + config.formcolumns;
    }

    // Crear y agregar el título de la página
    const titleContainer = document.createElement('div');
    // titleContainer.className = 'flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600';
	const title = document.createElement('h3');
	if (isModalForm === false) {
		title.className = 'text-lg font-semibold text-gray-900 dark:text-white mb-8';
		title.textContent = config.formtitle; 
	}

    titleContainer.appendChild(title);
    formContainer.appendChild(titleContainer);

    config.fields.forEach(field => {
        if (!field.label) {
            return;
        }
        if (field.pk) {
            return;
        }
        const divhtmlElement = document.createElement('div')
        // Crear la etiqueta del campo
		let label = document.createElement('label');
		if (field.fieldtype !== 'itemstable') {			
			label.setAttribute('for', field.fieldname);
			label.className = 'block mb-2 text-sm font-medium text-gray-900 dark:text-white';
			label.textContent = field.label || field.fieldname;
			divhtmlElement.appendChild(label);
		}
        //formGroup.appendChild(label);

        // Crear el campo basado en el tipo de dato
        let inputElement;
        
        switch (field.fieldtype) {
            case 'string':
                if (field.options) {
                    inputElement = document.createElement('select');
                    inputElement.id = prefixID + '-' + field.fieldname;
                    inputElement.name = prefixID + '-' + field.fieldname;
                    // Crear y agregar la opción "Seleccione una opción"
                    const defaultOption = document.createElement('option');
                    defaultOption.value = "0";
                    defaultOption.textContent = field.defaultoption || "Seleccione una opci\u00F3n";
                    if (field.required === true || field.required === 1) {
                        defaultOption.disabled = true;
                    }
                    defaultOption.selected = true;
                    inputElement.appendChild(defaultOption);

                    field.options.split('\n').forEach((option, index) => {
                        const [text, value] = option.split('|');
                        const optionElement = document.createElement('option');
                        optionElement.value = field.values.split(',')[index];
                        optionElement.textContent = text || value;
                        inputElement.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                        inputElement.appendChild(optionElement);
                    });
                } else {
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
                    inputElement.id = prefixID + '-' + field.fieldname;
                    inputElement.name = prefixID + '-' + field.fieldname;
                    inputElement.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                    if (field.texttransform === 'uppercase') {
                        inputElement.classList.add('uppercase');
                    } else if (field.texttransform === 'lowercase') {
                        inputElement.classList.add('lowercase');
                    } else if (field.texttransform === 'capitalize') {
                        inputElement.classList.add('capitalize');
                    } else if (field.texttransform === 'title-case') {
                        inputElement.classList.add('title-case');
                    }
                    if (field.disabled === 1) {
                        inputElement.setAttribute('aria-label', 'disabled input');
                        inputElement.className = 'bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                        inputElement.classList.add('cursor-not-allowed');
                        inputElement.readOnly = true;
                    }
                }
                break;
            case 'int':
                if (field.options) {
                    inputElement = document.createElement('select');
                    inputElement.id = prefixID + '-' + field.fieldname;
                    inputElement.name = prefixID + '-' + field.fieldname;
                    const defaultOption = document.createElement('option');
                    defaultOption.value = "";
                    defaultOption.textContent = field.defaultoption || "Seleccione una opci\u00F3n";
                    if (field.required === true || field.required === 1) {
                        defaultOption.disabled = true;
                    }
                    defaultOption.selected = true;
                    inputElement.appendChild(defaultOption);

                    field.options.split('\n').forEach((option, index) => {
                        const [text, value] = option.split('|');
                        const optionElement = document.createElement('option');
                        optionElement.value = field.values.split(',')[index];
                        optionElement.textContent = text || value;
                        inputElement.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                        inputElement.appendChild(optionElement);
                });
                } else {
                    inputElement = document.createElement('input');
                    inputElement.type = 'number';
                    inputElement.id = prefixID + '-' + field.fieldname;
                    inputElement.name = prefixID + '-' + field.fieldname;
                    inputElement.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                    if (field.disabled === 1) {
                        inputElement.setAttribute('aria-label', 'disabled input');
                        inputElement.className = 'bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                        inputElement.classList.add('cursor-not-allowed');
                        inputElement.readOnly = true;
                    }
                }
                break;
            case 'date':
                inputElement = document.createElement('input');
                inputElement.type = 'date';
                inputElement.id = prefixID + '-' + field.fieldname;
                inputElement.name = prefixID + '-' + field.fieldname;
                inputElement.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500';
                if (field.disabled === 1) {
                    //inputElement.setAttribute('aria-label', 'disabled input');
                    inputElement.className = 'bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                    inputElement.classList.add('cursor-not-allowed');
                    inputElement.readOnly = true;
                }
                break;
            case 'boolean':
                inputElement = document.createElement('input');
                inputElement.type = 'checkbox';
                inputElement.id = prefixID + '-' + field.fieldname;
                inputElement.name = prefixID + '-' + field.fieldname;
                inputElement.className = 'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600';
                break;
            case 'string-radio':
                inputElement = document.createElement('div');
                inputElement.className = 'flex';

                const options = field.radiooptions ? field.radiooptions.split('\n') : [];
                const values = field.values ? field.values.split(',') : options;
                let isFirst = true;  // Identifico el primer radio button

                options.forEach((option, index) => {
                    const text = option.trim();
                    const value = values[index] ? values[index].trim() : text;

                    const radioContainer = document.createElement('div');
                    radioContainer.className = 'flex items-center me-4';

                    const radioInput = document.createElement('input');
                    radioInput.type = 'radio';
                    radioInput.id = `${prefixID}-${field.fieldname}-${index}`;
                    radioInput.name = prefixID + '-' + field.fieldname;
                    radioInput.value = field.values.split(',')[index];
                    radioInput.className = 'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600';

                    if (field.checked && field.checked === value) {
                        radioInput.checked = true;
                    }

                    if (field.required === 1) {
                        if (isFirst) {
                            radioInput.required = true;
                            isFirst = false;  // Cambia a false para que solo el primer radio button tenga el atributo
                        }
                    }

                    if (field.disabled === 1) {
                        radioInput.disabled = true;
                    }
                    const radioLabel = document.createElement('label');
                    radioLabel.setAttribute('for', radioInput.id);
                    radioLabel.className = 'ms-2 text-sm font-medium text-gray-900 dark:text-gray-300';
                    radioLabel.textContent = text;

                    radioContainer.appendChild(radioInput);
                    radioContainer.appendChild(radioLabel);
                    inputElement.appendChild(radioContainer);
                    if (field.fullwidth === 1) {
                        divhtmlElement.className = 'col-span-2';
                    }

                });

                if (field.hide) {
                    inputElement.style.display = 'none';
                }

                break;
            case 'longtext':
                inputElement = document.createElement('textarea');
                inputElement.id = prefixID + '-' + field.fieldname;
                inputElement.name = prefixID + '-' + field.fieldname;
                inputElement.className = 'block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                inputElement.rows = field.rows;
                if (field.fullwidth === 1) {
                    divhtmlElement.className = 'col-span-2';
                }
                if (field.disabled === 1) {
                    inputElement.setAttribute('aria-label', 'disabled input');
                    inputElement.className = 'block p-2.5 w-full text-sm text-gray-900 bg-gray-200 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                    inputElement.classList.add('cursor-not-allowed');
                    inputElement.readOnly = true;
                }
                if (field.texttransform === 'uppercase') {
                    inputElement.classList.add('uppercase');
                } else if (field.texttransform === 'lowercase') {
                    inputElement.classList.add('lowercase');
                } else if (field.texttransform === 'capitalize') {
                    inputElement.classList.add('capitalize');
                } else if (field.texttransform === 'title-case') {
                    inputElement.classList.add('title-case');
                }
                break;
            case 'itemstable':
                let modalDivContent = '';
                if (isModalForm === true) {
                    modalDivContent = 'modalContent' + elementID;
                }
                generateFormItems(field, modalDivContent);
                createModal(field.formschema, field.fkfield);
                break;
            default:
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.id = prefixID + '-' + field.fieldname;
                inputElement.name = prefixID + '-' + field.fieldname;
                inputElement.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                if (field.disabled === 1) {
                    inputElement.setAttribute('aria-label', 'disabled input');
                    inputElement.className = 'bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
                    inputElement.classList.add('cursor-not-allowed');
                    inputElement.readOnly = true;
                }
                if (field.texttransform === 'uppercase') {
                    inputElement.classList.add('uppercase');
                } else if (field.texttransform === 'lowercase') {
                    inputElement.classList.add('lowercase');
                } else if (field.texttransform === 'capitalize') {
                    inputElement.classList.add('capitalize');
                } else if (field.texttransform === 'title-case') {
                    inputElement.classList.add('title-case');
                }
        }

        if (inputElement) {
            if (field.required === true || field.required === 1) {
                inputElement.required = true;
            }
            if (field.placeholder) {
                inputElement.placeholder = field.placeholder;
            }
            if (field.unique) {
                inputElement.setAttribute('data-unique', true);
            }
            divhtmlElement.appendChild(inputElement);
        }
        formGroup.appendChild(divhtmlElement);
        formContainer.appendChild(formGroup);
    });

};

function generateFormItems(field, ModalDivContent) {

    let principalDiv;
    if (ModalDivContent === '') {
        principalDiv = document.getElementById("div-principal");
    } else {
        principalDiv = document.getElementById(ModalDivContent);
    }
    const modalName = 'Modal' + field.fieldname;
    const prefixID = field.fieldname;
    const container = document.createElement('div');
    container.id = 'div' + field.fieldname;
    container.className = 'bg-white dark:bg-gray-800 z-40 relative shadow-md sm:rounded-lg overflow-hidden';

    // Crear la tabla
    const table = GenerateTable(field.label, field.description, field.fieldname, field.columns, field.actions, []);
    //const table = document.createElement('table');
    //table.className = 'text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400';
	//table.div = 'table' + field.fieldname;

    //const caption = document.createElement('caption');
    //caption.classList.add('p-5', 'text-lg', 'font-semibold', 'text-left', 'rtl:text-right', 'text-gray-900', 'bg-white', 'dark:text-white', 'dark:bg-gray-800');
    //caption.innerHTML = `
    //    ${field.label || 'Título de la tabla'}
    //    <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
    //        ${field.description || 'Descripción de la tabla'}
    //    </p>
    //`;
    //table.appendChild(caption);

    // Crear el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    tbody.id = field.fieldname + '-tbody';
    table.appendChild(tbody);

    // Agregar el botón para añadir nuevas filas
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'btncreate' + field.fieldname;
    button.className = 'px-5 py-2.5 text-sm font-medium text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 m-4';
    button.innerHTML = '<svg class="h-3.5 w-3.5 mr-2" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>Nuevo';    
    button.setAttribute('data-modal-target', modalName);
    button.setAttribute('data-modal-toggle', modalName);
    const formName = 'form' + field.fieldname;


    //creo un div para botones
    const divbuttons = document.createElement('div');
    divbuttons.id = 'divbuttons' + '-' + table.id;
    divbuttons.appendChild(button);


    button.addEventListener('click', function (e) {
        e.preventDefault();
        clearForm(formName);
        //fillFormData(fullDataRow, fieldname, primarykey);
        const submitButtonId = generateAddItemButton(field.fieldname);
        addButtonClickSaveForm(submitButtonId, formName, field.fieldname, field.pkfield, field.fkfield, modalName, true);
    });
    // Añadir elementos al contenedor
    
    container.appendChild(table);
    container.appendChild(divbuttons);

    // Añadir el contenedor al documento
    principalDiv.appendChild(container);
}

function createModal(field, parentFkfield) {
    
    const modalName = 'Modal' + field.formname;

    // Crear el contenedor principal del modal
    const modalContainer = document.createElement('div');
    modalContainer.id = modalName;
    modalContainer.tabIndex = -1;
    modalContainer.setAttribute('aria-hidden', 'true');
    modalContainer.className = 'hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full';

    // Crear el contenedor del modal content
    const modalContentWrapper = document.createElement('div');
    modalContentWrapper.className = 'relative p-4 w-full max-w-2xl h-full md:h-auto';

    // Crear el contenido del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5';
    modalContent.id = 'modalContent' + field.formname;

    // Crear el encabezado del modal
    const modalHeader = document.createElement('div');
    modalHeader.className = 'flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600';

    const modalTitle = document.createElement('h3');
    modalTitle.className = 'text-lg font-semibold text-gray-900 dark:text-white';
    modalTitle.textContent = 'Agregar ' + field.formtitle;

    const modalCloseButton = document.createElement('button');
    modalCloseButton.type = 'button';
    modalCloseButton.className = 'text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white';
    modalCloseButton.setAttribute('data-modal-toggle', modalName);
    modalCloseButton.innerHTML = '<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg><span class="sr-only">Close modal</span>';

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(modalCloseButton);

    // Crear el cuerpo del modal y el formulario
    const modalForm = document.createElement('form');
    modalForm.id = 'form' + field.formname;
    modalForm.action = '#'; 
    modalForm.method = 'post'; 
    document.body.appendChild(modalForm);   

    // Crear el pie del modal con el botón de enviar
    //const submitButton = document.createElement('button');
    //const submitButtonId = field.formname + '-' + 'formMasterSaveItemBtn';
    //submitButton.type = 'submit';
    //submitButton.className = 'text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ';
    //submitButton.innerHTML = '<svg class="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>Guardar';
    //submitButton.id = submitButtonId;
    
    // Añadir el header, form, y el pie al contenido del modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalForm);

    // Añadir el contenido del modal al contenedor
    modalContentWrapper.appendChild(modalContent);
    modalContainer.appendChild(modalContentWrapper);

    // Añadir el modal completo al cuerpo del documento
    document.body.appendChild(modalContainer);

    generateForm(field, field.formname, true);
    //modalForm.appendChild(submitButton); //Agregar el botón submit al modal del item.


    //const htmlFormName = 'form' + field.formname;
    //Agrego la funcionalidad al botón para agregar items. último parámetro en true para indicar que es un boton de un item del form principal.

    //addButtonClickSaveForm(submitButton.id, htmlFormName, field.tablename, field.fieldpk, parentFkfield, modalName, true);

}

function generateAddItemButton(fieldformname) {

    const submitButtonId = fieldformname + '-' + 'formMasterSaveItemBtn';
    const existingSubmitButton = document.getElementById(submitButtonId);
    if (existingSubmitButton) {
        existingSubmitButton.remove();
    }
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ';
    submitButton.innerHTML = '<svg class="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>Guardar';
    submitButton.id = submitButtonId;

    const modalFormId = 'form' + fieldformname;
    const modalForm = document.getElementById(modalFormId);

    modalForm.appendChild(submitButton);
    return submitButtonId;
}

function GenerateTable(labelTable, descriptionTable, fieldname, columns, actions, TableData, primarykey = null, fkfield = null) {
    // Obtener el contenedor de la tabla si ya existe
    let existingTable = document.getElementById('table' + fieldname);
    let table;
    const columnNames = columns.split('\n').map(col => col.trim());
    const modalName = 'Modal' + fieldname;
    const htmlFormName = 'form' + fieldname;
    //const submitButtonId = fieldname + '-' + 'formMasterSaveItemBtn';
    const tbodyID = fieldname + '-tbody';

        // Crear el contenedor de la tabla
        table = document.createElement('table');
        table.className = 'text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400';
        table.id = 'table' + fieldname;

        // Crear el encabezado
        const thead = document.createElement('thead');
        thead.className = 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400';
        const headerRow = document.createElement('tr');

        // Crear las columnas según el parámetro 'columns'		
        columnNames.forEach(column => {
            const th = document.createElement('th');
            th.scope = 'col';
            th.className = 'px-4 py-3';
            th.textContent = column;
            headerRow.appendChild(th);
        });

        // Agregar la columna para acciones si existen acciones
        if (actions) {
            const actionTh = document.createElement('th');
            actionTh.scope = 'col';
            actionTh.className = 'px-4 py-3';
            actionTh.innerHTML = '<span class="sr-only">Actions</span>';
            headerRow.appendChild(actionTh);
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);
    

    // Crear el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    tbody.id = tbodyID;

    // Verificar si existen datos para llenar las filas
    if (TableData.data && TableData.data.length > 0) {
        TableData.data.forEach(row => {
            let rowId;
            const tr = document.createElement('tr');
            tr.className = 'border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700';

            Object.keys(row).forEach(key => {
                // Si key coincide con el primary key (pkfield), lo usamos para establecer el id
                if (key === primarykey) {
                    rowId = row[key];
                    tr.id = "tr" + rowId;
                }
            });

            // Llenar las celdas de cada fila con los valores del objeto 'row' que coincidan con 'columns'
            columnNames.forEach(column => {
                const td = document.createElement('td');
                td.className = 'px-4 py-3';
                td.textContent = row[column] || '';  // Mostrar datos o vacío si no hay valor
                tr.appendChild(td);
            });

            // Agregar las acciones si existen
            if (actions) {
                const tdActions = document.createElement('td');
                tdActions.className = 'px-4 py-3 flex items-center justify-end';

                // Botón desplegable para las acciones
                const dropdownButton = document.createElement('button');
                dropdownButton.id = `${fieldname}-dropdown-button-${rowId}`;
                dropdownButton.dataset.dropdownToggle = `${fieldname}-dropdown-${rowId}`;
                dropdownButton.className = 'inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100';
                dropdownButton.type = 'button';

                // Agregar el ícono al botón de acciones
                const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                iconSvg.classList.add("w-5", "h-5");
                iconSvg.setAttribute("fill", "currentColor");
                iconSvg.setAttribute("viewBox", "0 0 20 20");
                iconSvg.setAttribute("aria-hidden", "true");

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", "M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z");
                iconSvg.appendChild(path);

                dropdownButton.appendChild(iconSvg);
                tdActions.appendChild(dropdownButton);

                // Crear el menú desplegable
                const dropdownDiv = document.createElement('div');
                dropdownDiv.id = `${fieldname}-dropdown-${rowId}`;
                dropdownDiv.className = 'hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600';

                const dropdownUl = document.createElement('div');
                dropdownUl.className = 'py-1 text-sm text-gray-700 dark:text-gray-200';
                dropdownUl.setAttribute('aria-labelledby', `${fieldname}-dropdown-button-${rowId}`);

                // Crear la opción de editar
                const editDiv = document.createElement('div');
                const editLink = document.createElement('a');
                editLink.href = '#';
                editLink.id = `table-${fieldname}-btn-edit-${rowId}`;
                editLink.className = 'block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white';
                editLink.setAttribute('data-modal-target', modalName);
                editLink.setAttribute('data-modal-toggle', modalName);
                editLink.textContent = 'Editar';
                editDiv.appendChild(editLink);
                dropdownUl.appendChild(editDiv);

                // Crear la opción de eliminar
                const deleteDiv = document.createElement('div');
                deleteDiv.className = 'py-1';

                const deleteLink = document.createElement('a');
                deleteLink.href = '#';
                deleteLink.id = `table-${fieldname}-btn-delete-${rowId}`;
                deleteLink.className = 'block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white';
                deleteLink.textContent = 'Eliminar';
                deleteLink.addEventListener('click', function (e) {
                    e.preventDefault(); 
                    removeRowInTable(e, fieldname, rowId, primarykey);
                });

                const fullDataRow = TableData.fulldatarow.find(fullRow => {
                    // Convertimos ambas claves a minúsculas para hacer la comparación
                    return Object.keys(fullRow).find(key => key.toLowerCase() === primarykey.toLowerCase())
                        && fullRow[Object.keys(fullRow).find(key => key.toLowerCase() === primarykey.toLowerCase())] === rowId;
                });

                editLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    fillFormData(fullDataRow, fieldname, primarykey);
                    const submitButtonId = generateAddItemButton(fieldname);
                    addButtonClickSaveForm(submitButtonId, htmlFormName, fieldname, primarykey, fkfield, modalName, true, rowId);
                });

                deleteDiv.appendChild(deleteLink);
                dropdownDiv.appendChild(dropdownUl);
                dropdownDiv.appendChild(deleteDiv);

                tdActions.appendChild(dropdownDiv);
                tr.appendChild(tdActions);
            }

            tbody.appendChild(tr);
        });
    }

    const caption = document.createElement('caption');
    caption.classList.add('p-5', 'text-lg', 'font-semibold', 'text-left', 'rtl:text-right', 'text-gray-900', 'bg-white', 'dark:text-white', 'dark:bg-gray-800');
    caption.innerHTML = `
        ${labelTable || 'Título de la tabla'}
        <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
            ${descriptionTable || 'Descripción de la tabla'}
        </p>
    `;
    table.appendChild(caption);


    if (existingTable) {
        table.appendChild(tbody);
        existingTable.parentNode.replaceChild(table, existingTable);
        return;
    } else {
        table.appendChild(tbody);
    }
    //creo el evento aftertableCreated
    const eventName = 'tableCreated-' + table.id;
    // El evento entrega todo el html de la tabla para recorrerlo y hacer lo que se necesite con ella.
    const event = new CustomEvent(eventName, {
        detail: table
    });
    document.dispatchEvent(event);
    return table;
}


//CRUD

function onError(error) {
    showNotification('error', 'Se ha presentado un error al procesar su solicitud. Si el error persiste, contacte a soporte. Detalle de error: ' + error);
}

function onSuccess(result) {
    alert(result);
};
function removeRowInTableOK(id) {
    if (id) {
        const elementID = 'tr' + id; 
        const row = document.getElementById(elementID); 
        if (row) { 
            row.classList.add('bg-red-200');
            row.classList.add('fade-out');
            setTimeout(() => {
                row.remove();
            }, 2000);
        } else {
            showNotification('error', 'Se ha presentado un error con su solicitud. No se encontró el elemento con ID: ' + elementID);
        }
    } else {
        showNotification('error', 'Error: ID no proporcionado');
    }
}

function removeRowInTable(e, tableName, idrow, pkfield) {
    if (idrow) {
        if (confirm('¿Desea eliminar este registro?')) {
            PageMethods.RemoveItemsTable(
                tableName,
                idrow,
                pkfield,
                function (response) { removeRowInTableOK(idrow); },
                onError);
        }
    }
}

function updateOrCreateRow(tableName, data, rowId, primarykey, columns, actions, modalName) {
    //console.log(data);
    const tableID = 'table' + tableName;
    const fieldname = tableName;
    const rowData = data.rowData;
    const table = document.getElementById(tableID);
    const fullDataRow = data.fulldatarow[0];
    //const submitButtonId = fieldname + '-' + 'formMasterSaveItemBtn';
    if (!table) {
        console.error(`Table with ID "${tableID}" not found.`);
    }    
    const columnNames = columns.split('\n').map(col => col.trim());
    const htmlFormName = 'form' + tableName;
    const tbodyID = tableName + '-tbody';
    const tbodyEl = document.getElementById(tbodyID);
    let tr;
    tr = document.createElement('tr');
    tr.className = 'border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700';
    tr.id = 'tr' + rowId;
    tr.classList.add('bg-green-200');

    
    rowData.forEach(row => { // Iterar sobre cada objeto en rowData        
        columnNames.forEach(column => {
            const td = document.createElement('td');
            td.className = 'px-4 py-3';
            td.textContent = row[column] || ''; // Acceder a las propiedades del objeto
            tr.appendChild(td);
        });

        if (actions) {
            const tdActions = document.createElement('td');
            tdActions.className = 'px-4 py-3 flex items-center justify-end';

            // Botón desplegable para las acciones
            const dropdownButton = document.createElement('button');
            dropdownButton.id = `${fieldname}-dropdown-button-${rowId}`;
            dropdownButton.dataset.dropdownToggle = `${fieldname}-dropdown-${rowId}`;
            dropdownButton.className = 'inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100';
            dropdownButton.type = 'button';

            const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            iconSvg.classList.add("w-5", "h-5");
            iconSvg.setAttribute("fill", "currentColor");
            iconSvg.setAttribute("viewBox", "0 0 20 20");
            iconSvg.setAttribute("aria-hidden", "true");

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", "M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z");
            iconSvg.appendChild(path);

            dropdownButton.appendChild(iconSvg);
            tdActions.appendChild(dropdownButton);

            // Crear el menú desplegable
            const dropdownDiv = document.createElement('div');
            dropdownDiv.id = `${fieldname}-dropdown-${rowId}`;
            dropdownDiv.className = 'hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600';

            const dropdownUl = document.createElement('div');
            dropdownUl.className = 'py-1 text-sm text-gray-700 dark:text-gray-200';
            dropdownUl.setAttribute('aria-labelledby', `${fieldname}-dropdown-button-${rowId}`);

            // Crear la opción de editar
            const editDiv = document.createElement('div');
            const editLink = document.createElement('a');
            editLink.href = '#';
            editLink.id = `table-${fieldname}-btn-edit-${rowId}`;
            editLink.className = 'block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white';
            editLink.setAttribute('data-modal-target', modalName);
            editLink.setAttribute('data-modal-toggle', modalName);
            editLink.textContent = 'Editar';
            editDiv.appendChild(editLink);
            dropdownUl.appendChild(editDiv);

            // Crear la opción de eliminar
            const deleteDiv = document.createElement('div');
            deleteDiv.className = 'py-1';
            const deleteLink = document.createElement('a');
            deleteLink.href = '#';
            deleteLink.id = `table-${fieldname}-btn-delete-${rowId}`;
            deleteLink.className = 'block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white';
            deleteLink.textContent = 'Eliminar';
            deleteLink.addEventListener('click', function (e) {
                e.preventDefault();
                removeRowInTable(e, fieldname, rowId, primarykey);
            });            
            editLink.addEventListener('click', function (e) {
                e.preventDefault();
                fillFormData(fullDataRow, fieldname, primarykey);
                const submitButtonId = generateAddItemButton(fieldname);
                addButtonClickSaveForm(submitButtonId, htmlFormName, fieldname, primarykey, data.fkfield, modalName, true, rowId);
            });

            deleteDiv.appendChild(deleteLink);
            dropdownDiv.appendChild(dropdownUl);
            dropdownDiv.appendChild(deleteDiv);

            tdActions.appendChild(dropdownDiv);
            tr.appendChild(tdActions);
        }
    });
    const existingRow = document.getElementById(`tr${rowId}`);
    if (existingRow) {
        existingRow.parentNode.replaceChild(tr, existingRow);
        assignRowListeners(rowId, fieldname, fullDataRow, primarykey, data.fkfield, modalName);
        setTimeout(() => {
            tr.classList.remove('bg-green-200');
        }, 2000);
        initFlowbite();
        return;
    } else {
        tbodyEl.appendChild(tr);
    }
    // Añadir efecto de fade-out para el color verde después de 2 segundos
    setTimeout(() => {
        tr.classList.remove('bg-green-200');
    }, 2000);

    initFlowbite();

    //creo el evento afterRowCreated
    const eventName = 'rowCreated-' + tr.id;
    // El evento entrega todo el html de la fila para recorrerlo y hacer lo que se necesite con él.
    const event = new CustomEvent(eventName, {
        detail: tr
    });
    document.dispatchEvent(event);

    return tr;
}

function assignRowListeners(rowId, fieldname, fullDataRow, primarykey, fkfield, modalName) {
    const editLink = document.getElementById(`table-${fieldname}-btn-edit-${rowId}`);
    //const deleteLink = document.getElementById(`table-${fieldname}-btn-delete-${rowId}`);
    const htmlFormName = 'form' + fieldname;
    if (editLink) {
        editLink.addEventListener('click', function (e) {
            e.preventDefault();
            fillFormData(fullDataRow, fieldname, primarykey);
            const submitButtonId = generateAddItemButton(fieldname);
            addButtonClickSaveForm(submitButtonId, htmlFormName, fieldname, primarykey, fkfield, modalName, true, rowId);
        });
    }
    //if (deleteLink) {
    //    deleteLink.addEventListener('click', function (e) {
    //        e.preventDefault();
    //        removeRowInTable(e, fieldname, rowId, primarykey);
    //    });
    //}
}


function GetDataForUpdateItemForm(e, tableName, idrow, pkfield) {
    if (tableName && idrow && pkfield) {
            PageMethods.FormMasterGetDataUpdateItemForm(
                tableName,
                idrow,
                pkfield,
                OpenModalWithItemData,
                onError);
    }
}

function OpenModalWithItemData(jsonObject) {
    const formDataJson = JSON.parse(jsonObject);
    fillFormData(formDataJson.data, formDataJson.tableName, formDataJson.fieldpk);
}

function handleSaveItemClick(e, formId, tableName, fieldpk, parentFkfield, modalName, rowId) {
    e.preventDefault();
    const form = document.getElementById(formId);
    if (form.checkValidity()) {
        FormMasterBtnItemSaveHandleClick(formId, tableName, fieldpk, parentFkfield, modalName, rowId);
    } else {
        form.reportValidity();
    }
}

function handleSaveClick(e, formId, tableName, fieldpk) {
    e.preventDefault();
    const form = document.getElementById(formId);
    if (form.checkValidity()) {
        FormMasterBtnSaveHandleClick(formId, tableName, fieldpk);
    } else {
        form.reportValidity();
    }
}

function addButtonClickSaveForm(buttonId, formId, tableName, fieldpk, parentFkfield = null, modalName = null, item = false, rowId = null) {
    const button = document.getElementById(buttonId);

    button.type = 'submit';
    button.setAttribute('form', formId);

    // Crear el manejador específico para el botón
    const eventHandler = item
        ? (e) => handleSaveItemClick(e, formId, tableName, fieldpk, parentFkfield, modalName, rowId)
        : (e) => handleSaveClick(e, formId, tableName, fieldpk);

    // Limpiar eventos anteriores y agregar el nuevo manejador
    //button.removeEventListener('click', eventHandler);
    button.addEventListener('click', eventHandler);
}


//function FormMasterBtnSaveHandleClick(formId, tableName, fieldpk) {
//    // Llamar a la función formToJson y pasar el formId
//    const prefixID = tableName + '-';
//    const formDataJson = JSON.stringify(formToJson(formId, prefixID));
//    //console.log(formDataJson);
//    const id = FormMasterGetId(fieldpk);

//    if (id) {
//        PageMethods.FormMasterUpdateForm(
//            tableName,
//            formDataJson,
//            fieldpk,
//            id,
//            FormMasterOnUpdateSuccess,
//            onError
//        );
//    } else {
//        PageMethods.FormMasterSaveForm(
//            tableName,
//            formDataJson,
//            fieldpk,
//            FormMasterOnInsertSuccess,
//            onError
//        );
//    }
//}
function FormMasterBtnSaveHandleClick(formId, tableName, fieldpk) {
    const prefixID = tableName + '-';
    const formDataJson = JSON.stringify(formToJson(formId, prefixID));
    const id = FormMasterGetId(fieldpk);

    FormMasterBeforeSubmit(formDataJson).then((modifiedData) => {
        if (id) {
            PageMethods.FormMasterUpdateForm(
                tableName,
                modifiedData,
                fieldpk,
                id,
                FormMasterOnUpdateSuccess,
                onError
            );
        } else {
            PageMethods.FormMasterSaveForm(
                tableName,
                modifiedData,
                fieldpk,
                FormMasterOnInsertSuccess,
                onError
            );
        }
    }).catch((error) => {
        // Mostrar el mensaje de error
        showNotification('error', error);
    });
}


function FormMasterBtnItemSaveHandleClick(formId, tableName, fieldpk, parentFkfield, modalName, rowId = null) {
    // Llamar a la función formToJson y pasar el formId
    const prefixID = tableName + '-';
    const formDataJson = JSON.stringify(formToJson(formId, prefixID));
    //console.log(formDataJson);
    const parentId = FormMasterGetId(parentFkfield);
    if (parentId && rowId != null) {
        PageMethods.FormMasterUpdateItemForm(
            tableName,
            formDataJson,
            fieldpk,
            parentFkfield,
            parentId,
            modalName,
            rowId,
            FormMasterOnUpdateItemSuccess,
            onError
        );
    } else if (parentId && rowId === null) {
        PageMethods.FormMasterSaveItemForm(
            tableName,
            formDataJson,
            fieldpk,
            parentFkfield,
            parentId,
            modalName,
            FormMasterOnInsertItemSuccess,
            onError
        );
    }
}


function formToJson(formId, prefixID) {
    // Obtengo el formulario por su ID
    const form = document.getElementById(formId);

    // Creo un objeto vacío para almacenar los valores
    const formData = {};

    // Recorro todos los elementos del formulario
    Array.from(form.elements).forEach(element => {
        // Verificar si el elemento tiene un nombre y no está deshabilitado
        if (element.name && !element.disabled) {
            // Dependiendo del tipo de campo, obtener su valor
            if (element.type === 'checkbox') {
                formData[element.name] = element.checked;
            } else if (element.type === 'radio') {
                if (element.checked) {
                    formData[element.name] = element.value;
                }
            } else if (element.type === 'date' || element.type === 'datetime-local') {
                if (element.value === '' || element.value === null) {
                    formData[element.name] = null;
                } else {
                    const sqlFormattedDate = FormMasterDate(element.value);
                    formData[element.name] = sqlFormattedDate;
                }
            } else {
                formData[element.name] = element.value;
            }
        }
    });
    const cleanedData = removePrefixFromKeys(formData, prefixID);

    return cleanedData;
}

function removePrefixFromKeys(data, prefix = null) {

    if (!prefix) {
        return data;
    }

    const newData = {};

    Object.keys(data).forEach(key => {
        if (key.startsWith(prefix)) {
            const newKey = key.slice(prefix.length); // Eliminar el prefijo
            newData[newKey] = data[key];
        } else {
            newData[key] = data[key]; // Si no tiene el prefijo, mantener la clave original
        }
    });

    return newData;
}


function FormMasterGetId(fieldpk) {
    // obtener el id desde los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    let id = params.get(fieldpk);

    // Por seguridad, Si el id no se encuentra en la URL, intenta obtenerlo desde sessionStorage
    if (id === null) {
        id = sessionStorage.getItem(fieldpk);
    }
    return id;
}

function FormMasterOnInsertSuccess(jsonObject) {
    const formDataJson = JSON.parse(jsonObject);
    if (formDataJson.fieldpk) {
        const fieldpk = formDataJson.fieldpk;
        const fieldpkValue = formDataJson[fieldpk];
        if (fieldpkValue > 0) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set(fieldpk, fieldpkValue);
            window.history.replaceState({}, '', currentUrl);

            // Guardar el id en sessionStorage
            sessionStorage.setItem(fieldpk, fieldpkValue);
            updateIframeSrcWithId(fieldpk, fieldpkValue);
            // creo el evento después de insertar o actualizar. ideal para hacer otros procesos.
            FormMasterAfterSubmit(formDataJson);
            showNotification('success', 'Formulario guardado con \u00E9xito');
        } else {
            showNotification('error', 'Se ha presentado un error con su solicitud.');
        }
    } else {
        showNotification('error', 'Error al procesar su solicitud: ' + jsonObject.toString());
    }
}

function FormMasterOnUpdateSuccess(jsonObject) {
    const formDataJson = JSON.parse(jsonObject);
    if (formDataJson.fieldpk) {
        const fieldpk = formDataJson.fieldpk;
        const fieldpkValue = formDataJson[fieldpk];
        if (fieldpkValue > 0) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set(fieldpk, fieldpkValue);
            window.history.replaceState({}, '', currentUrl);

            // Guardar el id en sessionStorage
            sessionStorage.setItem(fieldpk, fieldpkValue);
            // creo el evento después de insertar o actualizar. ideal para hacer otros procesos.
            FormMasterAfterSubmit(formDataJson);
            showNotification('success', 'Formulario guardado con \u00E9xito');
        } else {
            showNotification('error', 'Se ha presentado un error con su solicitud.');
        }
    } else {
        showNotification('error', 'Error al procesar su solicitud: ' + jsonObject.toString());
    }
}

function FormMasterOnInsertItemSuccess(jsonObject) {
    const formDataJson = JSON.parse(jsonObject);
    if (formDataJson.fieldpk) {
        const fieldpk = formDataJson.fieldpk;
        const fieldpkValue = formDataJson[fieldpk];
        if (fieldpkValue > 0) {           
            // creo el evento después de insertar o actualizar. ideal para hacer otros procesos.
            FormMasterAfterItemSubmit(formDataJson);
            //const btnID = 'btncreate' + formDataJson.tableName;
            //const btnCreate = document.getElementById(btnID);
            const $targetModal = document.getElementById(formDataJson.modalName);
            if ($targetModal) {
                const modal = new Modal($targetModal);
                modal.hide();
            } else {
                console.error('Modal not found');
            }

            showNotification('success', 'Formulario guardado con \u00E9xito');

            updateOrCreateRow(formDataJson.tableName, formDataJson, formDataJson.rowId, formDataJson.primarykey, formDataJson.columnnames, formDataJson.actions, formDataJson.modalName);

        } else {
            showNotification('error', 'Se ha presentado un error con su solicitud.');
        }
    } else {
        const error = 'Error al procesar su solicitud: ' + jsonObject.toString();
        showNotification('error', error);
    }
}

function FormMasterOnUpdateItemSuccess(jsonObject) {
    const formDataJson = JSON.parse(jsonObject);
    if (formDataJson.fieldpk) {
        const fieldpk = formDataJson.fieldpk;
        const fieldpkValue = formDataJson[fieldpk];
        if (fieldpkValue > 0) {
            // creo el evento después de insertar o actualizar. ideal para hacer otros procesos.
            FormMasterAfterItemSubmit(formDataJson);
            //const btnID = 'btncreate' + formDataJson.tableName;
            //const btnCreate = document.getElementById(btnID);
            const $targetModal = document.getElementById(formDataJson.modalName);
            if ($targetModal) {
                const modal = new Modal($targetModal);
                modal.hide();
            } else {
                console.error('Modal not found');
            }

            showNotification('success', 'Formulario guardado con \u00E9xito');

            updateOrCreateRow(formDataJson.tableName, formDataJson, formDataJson.rowId, formDataJson.primarykey, formDataJson.columnnames, formDataJson.actions, formDataJson.modalName);
        } else {
            showNotification('error', 'Se ha presentado un error con su solicitud.');
        }
    } else {
        showNotification('error', 'Error al procesar su solicitud: ' + jsonObject.error);
    }
}

function FormMasterDate(dateString, format = 'YYYY-MM-DD HH:mm:ss') {
    
    const date = new Date(dateString);

    if (isNaN(date)) {
        return 'Fecha no válida';
    }

    // Extraemos las partes de la fecha
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Reemplazamos según el formato proporcionado
    let formattedDate = format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);

    return formattedDate;
}

////EVENTO AL GUARDAR O ACTUALIZAR EL FORMULARIO PRINCIPAL
function FormMasterAfterSubmit(formDataJson) {
    setTimeout(() => {
        const event = new CustomEvent('FormMasterAfterSubmit', {
            detail: formDataJson
        });
        document.dispatchEvent(event);
    }, 1000);
}

function FormMasterBeforeSubmit(formDataJson) {
    return new Promise((resolve, reject) => {
        const event = new CustomEvent('FormMasterBeforeSubmit', {
            detail: formDataJson
        });

        // Disparar el evento
        document.dispatchEvent(event);

        // Esperar un corto tiempo para permitir la manipulación
        setTimeout(() => {
            if (event.preventSubmit) {
                reject(event.errorMessage || 'Su solicitud no se pudo procesar.');
            } else {
                resolve(event.detail);  // Continuar con los datos modificados o los originales
            }
        }, 500);
    });
}
////EVENTO AL GUARDAR O ACTUALIZAR EL FORMULARIO PRINCIPAL

function FormMasterAfterItemSubmit(formDataJson) {
    setTimeout(() => {
        const event = new CustomEvent('FormMasterAfterItemSubmit', {
            detail: formDataJson
        });
        document.dispatchEvent(event);
    }, 2000);
}

function clearFieldPkInSessionStorage(field) {
    // Verificar si el valor de fieldpk existe en sessionStorage
    if (sessionStorage.getItem(field)) {
        // Eliminar el valor asociado a fieldpk
        sessionStorage.removeItem(field);
    }
}

function addParamsSrcIframesTabs(jsonConfigTabs, fieldpk) {
    const id = FormMasterGetId(fieldpk);
    if (id >= 1) {       

        jsonConfigTabs.forEach(tab => {
            const src = tab.src;
            if (tab.type === 'iframe') {
                const iframeID = 'Iframe' + tab.fieldname;
                const iframe = document.getElementById(iframeID);
                if (iframe) { 
                    const currentSrc = iframe.src;

                    // Verificar si el src del iframe contiene el parámetro fieldpk
                    if (currentSrc.includes(fieldpk + '=')) {
                        const newSrc = currentSrc.replace(new RegExp(fieldpk + '=[^&]*'), fieldpk + '=' + id);
                        iframe.src = newSrc;
                    } else {
                        iframe.src = src + '?' + fieldpk + '=' + id;
                    }
                }                
            }
        });
    } else {
        alert('Ocurrió un problema al crear el formulario actual y sus pestañas. Si el problema persiste comuníquese con soporte. Error: No se encuentra el id para crear los tabs del formulario');
    }
}

function updateIframeSrcWithId(fieldpk, id) {

    const iframes = document.querySelectorAll('iframe');

    // Recorrer todos los iframes
    iframes.forEach(iframe => {
        const currentSrc = iframe.src;

        // Verificar si el src del iframe contiene el parámetro fieldpk
        if (currentSrc.includes(fieldpk + '=')) {
            const newSrc = currentSrc.replace(new RegExp(fieldpk + '=[^&]*'), fieldpk + '=' + id);
            iframe.src = newSrc; 
        }
    });
}

function showNotification(type, message) {

    const notification = document.createElement('div');
    notification.classList.add('notification');

    // estilo base de la notificación
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
    notification.style.fontFamily = 'Arial, sans-serif';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.5s ease';

    if (type === 'success') {
        notification.style.backgroundColor = '#28a745'; // Verde para SUCCESS
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545'; // Rojo para ERROR
    }

    notification.innerText = message;

    document.body.appendChild(notification);

    // TIEMPO notificación 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0'; // Suavizar la desaparición
        setTimeout(() => {
            notification.remove();
        }, 500); // Esperar medio segundo para eliminar después de la animación
    }, 3000);
}

function getFormSizeCss(size) {
    // Dict con los tamaños de form definidos por flowbite
    const sizeDict = {
        small: 'max-w-md',
        default: 'max-w-lg',
        large: 'max-w-4xl',
        'extra-large': 'max-w-7xl'
    };
    return sizeDict[size] || sizeDict['default'];
}

function clearForm(formId) {
    var form = document.getElementById(formId);
    Array.from(form.elements).forEach(function (element) {
        switch (element.type) {
            case 'text':
            case 'password':
            case 'textarea':
            case 'email':
            case 'number':
            case 'url':
            case 'tel':
                element.value = '';
                break;
            case 'checkbox':
            case 'radio':
                element.checked = false;
                break;
            case 'select-one':
            case 'select-multiple':
                element.value = element.defaultValue || '';
                break;
            default:
                break;
        }
    });
}

function createDuplicateModal(containerId, pkfield, duplicatewithchildren) {
    // Crear el contenedor principal del modal
    const modal = document.createElement('div');
    modal.id = "duplicate-modal";
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    modal.className = "hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full";

    // Crear el contenido del modal
    const contentDiv = document.createElement('div');
    contentDiv.className = "relative p-4 w-full max-w-md max-h-full";

    const modalContent = document.createElement('div');
    modalContent.className = "relative bg-white rounded-lg shadow dark:bg-gray-700";

    // Botón para cerrar el modal
    const closeButton = document.createElement('button');
    closeButton.type = "button";
    closeButton.className = "absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white";
    closeButton.setAttribute('data-modal-hide', 'duplicate-modal');
    closeButton.innerHTML = `<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
    </svg><span class="sr-only">Close modal</span>`;
    modalContent.appendChild(closeButton);

    // Contenido principal del modal
    const innerDiv = document.createElement('div');
    innerDiv.className = "p-4 md:p-5";
    innerDiv.innerHTML = '<svg class="w-10 h-10 text-gray-400 dark:text-gray-500 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">                     <path d="M8 5.625c4.418 0 8-1.063 8-2.375S12.418.875 8 .875 0 1.938 0 3.25s3.582 2.375 8 2.375Zm0 13.5c4.963 0 8-1.538 8-2.375v-4.019c-.052.029-.112.054-.165.082a8.08 8.08 0 0 1-.745.353c-.193.081-.394.158-.6.231l-.189.067c-2.04.628-4.165.936-6.3.911a20.601 20.601 0 0 1-6.3-.911l-.189-.067a10.719 10.719 0 0 1-.852-.34 8.08 8.08 0 0 1-.493-.244c-.053-.028-.113-.053-.165-.082v4.019C0 17.587 3.037 19.125 8 19.125Zm7.09-12.709c-.193.081-.394.158-.6.231l-.189.067a20.6 20.6 0 0 1-6.3.911 20.6 20.6 0 0 1-6.3-.911l-.189-.067a10.719 10.719 0 0 1-.852-.34 8.08 8.08 0 0 1-.493-.244C.112 6.035.052 6.01 0 5.981V10c0 .837 3.037 2.375 8 2.375s8-1.538 8-2.375V5.981c-.052.029-.112.054-.165.082a8.08 8.08 0 0 1-.745.353Z"/></svg>';   

    const title = document.createElement('h3');
    title.className = "mb-1 text-xl font-bold text-gray-900 dark:text-white";
    title.textContent = "Duplicar Formularios";

    const description = document.createElement('p');
    description.className = "text-gray-500 dark:text-gray-400 mb-6";

    const countLabel = document.createElement('div');
    countLabel.className = "flex justify-between mb-1 text-gray-500 dark:text-gray-400";
    countLabel.innerHTML = `<span class="text-base font-normal">Elija las veces que desea duplicar el actual formulario:</span>`;

    const form = document.createElement('form');
    form.id = "duplicateForm";
    form.className = "max-w-sm mx-auto";

    const select = document.createElement('select');
    select.id = "duplicateCountSelect";
    select.name = "duplicateCountSelect";
    select.onchange = InputValueDuplicateModal;
    select.className = "block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
    }

    const customOption = document.createElement('option');
    customOption.value = "custom";
    customOption.textContent = "Otro";
    select.appendChild(customOption);

    form.appendChild(select);

    const input = document.createElement('input');
    input.type = "number";
    input.id = "duplicateCountInput";
    input.name = "duplicateCountInput";
    input.className = "hidden bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
    input.placeholder = "Max. 20 por solicitud";
    input.value = "1";
    input.max = "20";
    input.required = true;
    form.appendChild(input);

    //const br = document.createElement('br');
    //form.appendChild(br);
    
    const label = document.createElement('label');
    label.className = 'block mb-2 text-sm font-medium text-gray-900 dark:text-white';
    label.textContent = 'Incluir items o secciones relacionadas';
    form.appendChild(label);

    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.id = 'duplicateWithChildren';
    checkBox.name = 'duplicateWithChildren';
    checkBox.className = 'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600';
    checkBox.value = 'true';
    if (duplicatewithchildren === 1) {
        checkBox.disabled = true;
    }

    form.appendChild(checkBox);

    const footer = document.createElement('div');
    footer.className = "flex items-center mt-6 space-x-4 rtl:space-x-reverse";

    const submitButton = document.createElement('button');
    submitButton.id = "DuplicateSubmit";
    submitButton.type = "submit";
    submitButton.className = "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
    submitButton.textContent = "Duplicar";
    submitButton.setAttribute('data-modal-hide', 'duplicate-modal');
    submitButton.setAttribute('form', form.id);


    // Agregar todo al DOM
    innerDiv.appendChild(title);
    innerDiv.appendChild(description);
    innerDiv.appendChild(countLabel);
    innerDiv.appendChild(form);
    //innerDiv.appendChild(input);
    footer.appendChild(submitButton);
    form.appendChild(footer);
    modalContent.appendChild(innerDiv);
    contentDiv.appendChild(modalContent);
    modal.appendChild(contentDiv);

    submitButton.addEventListener('click', function (e) {
        e.preventDefault();
        DuplicateForm(pkfield, form.id);        
    });

    const container = document.getElementById(containerId);
    if (container) {
        container.appendChild(modal);
    } else {
        console.error(`No se encontró el contenedor con ID: ${containerId}`);
    }
}

// Función para actualizar el valor del input según el select
function InputValueDuplicateModal() {
    const select = document.getElementById("duplicateCountSelect");
    const input = document.getElementById("duplicateCountInput");

    if (select.value === "custom") {
        input.classList.remove("hidden");
        input.value = ""; // Limpiar el input al seleccionar "Otro"
    } else {
        input.classList.add("hidden");
        input.value = select.value; // Establecer el valor del input al seleccionado
    }
}

function DuplicateForm(pkfield, formId) {
    if (pkfield && formId) {
        if (confirm('¿Desea duplicar este formulario?')) {
            const id = FormMasterGetId(pkfield);
            const formDataJson = JSON.stringify(formToJson(formId, null));
            const form = document.getElementById(formId);

            if (form.checkValidity()) {

                PageMethods.FormMasterDuplicateForm(
                    formDataJson,
                    id,
                    onDuplicateSuccess,
                    onError);

            } else {
                form.reportValidity();
            }
        }
    }
}

function onDuplicateSuccess(jsonObject) {
    const formDataJson = JSON.parse(jsonObject);
        if (formDataJson) {
            const fieldpkValue = formDataJson[0];
            if (fieldpkValue) {
                FormMasterAfterDuplicate(formDataJson);
                showNotification('success', 'Formulario duplicado con \u00E9xito');
            } else {
                showNotification('error', 'Se ha presentado un error con su solicitud. ' + formDataJson.error);
            }
        } else {
            showNotification('error', 'Error al procesar su solicitud: ' + jsonObject.error);
        }
}

function FormMasterAfterDuplicate(formDataJson) {
    setTimeout(() => {
        const event = new CustomEvent('FormMasterAfterDuplicate', {
            detail: formDataJson
        });
        document.dispatchEvent(event);
    }, 1000);
}

const utilityActions = {
    share: function () {
        // Acción de compartir
    },
    print: function () {
        // Acción de imprimir
    },
    download: function () {
        // Acción de descargar
    },
    duplicate: function () {
        // Acción de duplicar
    },
    initButtons: function (optionsString) {
        const allButtons = {
            share: document.getElementById('fmutilityshare'),
            print: document.getElementById('fmutilityprint'),
            download: document.getElementById('fmutilitydownload'),
            duplicate: document.getElementById('fmutilityduplicate')
        };

        // Ocultar todos los botones inicialmente
        for (const key in allButtons) {
            allButtons[key].style.display = 'none';
        }

        // Dividir el string en un array de opciones
        const options = optionsString.split(',').map(option => option.trim());

        // Mostrar solo los botones que están en las opciones
        options.forEach(option => {
            if (allButtons[option]) {
                allButtons[option].style.display = 'flex'; // O 'block' según lo que necesites
            }
        });
    }
}

function FormMasterCreateModal(elementNameId, size, title, formcolumns) {
    // Crear el contenedor principal del modal
    const csssize = getFormSizeCss(size);
    const modal = document.createElement('div');
    modal.id = "modal" + '-' + elementNameId;
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    modal.className = "hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full";

    // Crear el contenido del modal
    const contentDiv = document.createElement('div');
    contentDiv.className = "relative p-4 w-full max-h-full " + csssize;

    const modalContent = document.createElement('div');
    modalContent.className = "relative bg-white rounded-lg shadow dark:bg-gray-700";

    // Contenido principal del modal
    const innerDiv = document.createElement('div');
    innerDiv.className = "p-4 md:p-5";

    // Crear el encabezado del modal
    const modalHeader = document.createElement('div');
    modalHeader.className = 'flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600';

    const modalTitle = document.createElement('h3');
    modalTitle.className = 'text-lg font-semibold text-gray-900 dark:text-white';
    modalTitle.textContent = title;

    const modalCloseButton = document.createElement('button');
    modalCloseButton.type = 'button';
    modalCloseButton.className = 'text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white';
    modalCloseButton.setAttribute('data-modal-toggle', modal.id);
    modalCloseButton.innerHTML = '<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg><span class="sr-only">Close modal</span>';

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(modalCloseButton);

    const description = document.createElement('p');
    description.className = "text-gray-500 dark:text-gray-400 mb-6";  

    const form = document.createElement('form');
    form.id = "modalForm" + '-' + elementNameId;
    form.className = "max-w-sm mx-auto";

    //despues del form creo un div formGroup que contiene todos los elementos del form.
    const formGroup = document.createElement('div');
    formGroup.id = 'formGroup' + elementNameId;
    if (formcolumns && formcolumns > 0) {
        formGroup.className = 'grid gap-4 mb-4 sm:grid-cols-' + formcolumns;
    } else {
        formGroup.className = 'grid gap-4 mb-4 ';
    }
    form.appendChild(formGroup);

    const footer = document.createElement('div');
    footer.className = "flex items-center mt-6 space-x-4 rtl:space-x-reverse";

    const submitButton = document.createElement('button');
    submitButton.id = "modalSubmit" + '-' + elementNameId;
    submitButton.type = "submit";
    submitButton.className = "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
    submitButton.textContent = "Duplicar";
    submitButton.setAttribute('data-modal-hide', modal.id);
    submitButton.setAttribute('form', form.id);


    // Agregar todo al DOM
    innerDiv.appendChild(modalHeader);
    innerDiv.appendChild(description);
    innerDiv.appendChild(form);
    //innerDiv.appendChild(input);
    footer.appendChild(submitButton);
    innerDiv.appendChild(footer);
    modalContent.appendChild(innerDiv);
    contentDiv.appendChild(modalContent);
    modal.appendChild(contentDiv);

    return modal;
}

function FormMasterCreateModalOpen(buttonId, modalName, text, iconPlus = false) {

    const openModalButton = document.createElement('button');
    openModalButton.type = 'button';
    openModalButton.id = buttonId;
    openModalButton.className = 'px-5 py-2.5 text-sm font-medium text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 m-4';
    if (iconPlus === true) {
        openModalButton.innerHTML = '<svg class="h-3.5 w-3.5 mr-2" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>' + text;
    } else {
        openModalButton.textContent = text;
    }
    openModalButton.setAttribute('data-modal-target', modalName);
    openModalButton.setAttribute('data-modal-toggle', modalName);

    return openModalButton;
}

function FormMasterCreateInput(inputId, type, placeholder, required) {
    const input = document.createElement('input');
    if (type) {
        input.type = type;
    } else {
        input.type = "text";
    }
    input.id = inputId;
    input.name = inputId;
    input.className = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
    if (placeholder) {
        input.placeholder = placeholder;
    }
    if (required === true) {
        input.required = required;
    }
    return input;
}

function FormMasterCreateSimpleText(text) {

    const label = document.createElement('div');
    label.className = "flex justify-between mb-1 text-gray-500 dark:text-gray-400";
    label.innerHTML = `<span class="text-base font-normal">` + text + `</span>`;
    return label;

}

function FormMasterCreateCheckBox(checkId, checkLabel, value) {
    
    const div = document.createElement('div');
    div.className = 'flex items-center mb-2';

    const checkbox = document.createElement('input');
    checkbox.id = checkId;
    checkbox.type = 'checkbox';
    checkbox.value = value;
    checkbox.className = 'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600';

    // Crear el label
    const label = document.createElement('label');
    label.setAttribute('for', checkId);
    label.className = 'ms-2 text-sm font-medium text-gray-900 dark:text-gray-300';
    label.textContent = checkLabel;

    // Añadir el checkbox y el label al div
    div.appendChild(checkbox);
    div.appendChild(label);

    // Devolver el div creado
    return div;
}

async function FormMasterGetDataFromQuery(query) {
    let resultData;
    if (!query || typeof query !== 'string' || query.trim() === '') {
        showNotification('error', 'Error: Su solicitud no se pudo procesar. El tipo de consulta no es v\u00E1lido.');
        return [];
    }
    function callPageMethods(query) {
        return new Promise((resolve, reject) => {
            PageMethods.GetDataFromQuery(
                query,
                function onSuccess(result) {
                    resolve(result);
                },
                function onError(error) {
                    reject("Su solicitud no se pudo procesar. Error: " + error);
                }
            );
        });
    }

    try {
        const jsonObject = await callPageMethods(query);
        const resultData = JSON.parse(jsonObject);
        return resultData;

    } catch (error) {
        showNotification('error', error);
        return [];
    }

    // Llamada con `.then()`
    //return callPageMethods(query)
    //    .then(jsonObject => {
    //        const resultData = JSON.parse(jsonObject);  // Convertir el JSON en objeto
    //        if (resultData && resultData.GetData) {     // Verificar que GetData existe
    //            return resultData;              // Devolver GetData si existe
    //        } else {
    //            showNotification('error', 'No se encontraron datos en la respuesta a su solicitud.');
    //            return [];
    //        }
    //    })
    //    .catch(error => {
    //        showNotification('error', error);
    //        return [];
    //    });

}

//function OnGetDataFromQuerySuccess(jsonObject) {
//    const formDataJson = JSON.parse(jsonObject);
//    if (formDataJson.GetData && formDataJson.GetData.length > 0) {
//        console.log(formDataJson);
//        return formDataJson.GetData; // Devolviendo los registros
//    } else {
//        showNotification('error', 'No se encontraron datos.');
//        return [];
//    }
//}
//function FormMasterCreateSelect(id, query, value, textOption) {
//    const selectElement = document.createElement('select');
//    selectElement.id = id;
//    selectElement.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
//    const dataQuery = FormMasterGetDataFromQuery(query)
//        .then(jsonObject => {
//            DATOS = jsonObject;
//            console.log(DATOS);

//            jsonObject.GetData.forEach(item => {
//                // Crear una opción
//                const option = document.createElement('option');
//                option.value = item[value];  // Asignar idusuario como value
//                option.textContent = item[textOption];  // Asignar nombre como texto
//                selectElement.appendChild(option);  // Añadir la opción al <select>
//            });
//        })
//        .catch(error => {
//            showNotification('error', error);
//            return [];
//        });
//    return selectElement;
//}

function FormMasterCreateSelect(id, options = [], query = null, value, textOption) {
    const selectElement = document.createElement('select');
    selectElement.id = id;
    selectElement.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';
    
    if (options.length > 0) {
        options.forEach(item => {
            const option = document.createElement('option');
            option.value = item[value];  
            option.textContent = item[textOption];  
            selectElement.appendChild(option);  
        });
    }
    
    if (query) {
        FormMasterGetDataFromQuery(query)
            .then(jsonObject => {
                jsonObject.GetData.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[value]; 
                    option.textContent = item[textOption];
                    selectElement.appendChild(option);
                });
            })
            .catch(error => {
                showNotification('error', error);
            });
    }
    return selectElement;
}

function LoadListView(listViewJson) {
    
    const btnNewForm = document.getElementById('newFormBtn');
    btnNewForm.onclick = function () {
        clearPkInSessionStorage(listViewJson.fieldpk);
        window.location.href = listViewJson.formpath;
    };
    createTableFromJson(listViewJson.data, listViewJson.formname, listViewJson.formpath, listViewJson.fieldpk, listViewJson.formtitle);
}


function createTableFromJson(jsonData, formname, path, fieldpk, formtitle) {
    // Verifica si hay datos en el JSON
    if (!jsonData || jsonData.length === 0) {
        console.error('El JSON está vacío o no es válido.');
        return;
    }

    // Obtiene las claves (columnas) desde el primer objeto del JSON
    const columns = Object.keys(jsonData[0]);
    const visibleColumns = columns.filter(column => column !== 'id');

    // Crea la tabla y sus componentes
    const table = document.createElement('table');
    table.id = 'listviewTable';
    table.className = 'display';
    table.style.width = '100%';

    // Crea el elemento thead y su fila de cabeceras
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    visibleColumns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Crea el elemento tbody y sus filas de datos
    const tbody = document.createElement('tbody');
    jsonData.forEach(row => {
        const tr = document.createElement('tr');

        tr.style.cursor = 'pointer';
        tr.onclick = function () {
            redirectToPage(path, fieldpk, row.id);
        };

        visibleColumns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column] !== null ? row[column] : '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Crea el elemento tfoot y su fila de cabeceras (opcional)
    const tfoot = document.createElement('tfoot');
    const footerRow = document.createElement('tr');
    visibleColumns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        footerRow.appendChild(th);
    });
    tfoot.appendChild(footerRow);
    table.appendChild(tfoot);

    // Crear el titulo del listview
    const htitle = document.createElement('h3');
    htitle.className = 'text-lg font-semibold text-gray-900 dark:text-white mb-8';
    htitle.innerText = 'Lista ' + formtitle;

    const container = document.getElementById('form-container');
    container.innerHTML = ''; 
    container.appendChild(htitle);
    container.appendChild(table);
    new DataTable('#listviewTable', {
        autoWidth: false,
        order: [[1]],
        language: {
            search: "Buscar:",
            entries: "Entradas",
            lengthMenu: "_MENU_ entradas por p\u00E1gina",
            info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        },
    });
}

// Función que redirige a la página con el parámetro id
function redirectToPage(path, fieldpk, id) {
    const url = `${path}?${fieldpk}=${id}`;
    window.location.href = url;
}

function clearPkInSessionStorage(field) {
    // Verificar si el valor de fieldpk existe en sessionStorage
    if (sessionStorage.getItem(field)) {
        // Eliminar el valor asociado a fieldpk
        sessionStorage.removeItem(field);
    }
}

