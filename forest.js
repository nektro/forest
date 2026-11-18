(()=>{var WA=Object.defineProperty,Q=(A,n)=>WA(A,"name",{value:n,configurable:!0}),sn=class{static{Q(this,"Edit")}startPosition;oldEndPosition;newEndPosition;startIndex;oldEndIndex;newEndIndex;constructor({startIndex:A,oldEndIndex:n,newEndIndex:I,startPosition:e,oldEndPosition:C,newEndPosition:t}){this.startIndex=A>>>0,this.oldEndIndex=n>>>0,this.newEndIndex=I>>>0,this.startPosition=e,this.oldEndPosition=C,this.newEndPosition=t}editPoint(A,n){let I=n,e={...A};if(n>=this.oldEndIndex){I=this.newEndIndex+(n-this.oldEndIndex);let C=A.row;e.row=this.newEndPosition.row+(A.row-this.oldEndPosition.row),e.column=C===this.oldEndPosition.row?this.newEndPosition.column+(A.column-this.oldEndPosition.column):A.column}else if(n>this.startIndex)I=this.newEndIndex,e.row=this.newEndPosition.row,e.column=this.newEndPosition.column;return{point:e,index:I}}editRange(A){let n={startIndex:A.startIndex,startPosition:{...A.startPosition},endIndex:A.endIndex,endPosition:{...A.endPosition}};if(A.endIndex>=this.oldEndIndex){if(A.endIndex!==Number.MAX_SAFE_INTEGER){if(n.endIndex=this.newEndIndex+(A.endIndex-this.oldEndIndex),n.endPosition={row:this.newEndPosition.row+(A.endPosition.row-this.oldEndPosition.row),column:A.endPosition.row===this.oldEndPosition.row?this.newEndPosition.column+(A.endPosition.column-this.oldEndPosition.column):A.endPosition.column},n.endIndex<this.newEndIndex)n.endIndex=Number.MAX_SAFE_INTEGER,n.endPosition={row:Number.MAX_SAFE_INTEGER,column:Number.MAX_SAFE_INTEGER}}}else if(A.endIndex>this.startIndex)n.endIndex=this.startIndex,n.endPosition={...this.startPosition};if(A.startIndex>=this.oldEndIndex){if(n.startIndex=this.newEndIndex+(A.startIndex-this.oldEndIndex),n.startPosition={row:this.newEndPosition.row+(A.startPosition.row-this.oldEndPosition.row),column:A.startPosition.row===this.oldEndPosition.row?this.newEndPosition.column+(A.startPosition.column-this.oldEndPosition.column):A.startPosition.column},n.startIndex<this.newEndIndex)n.startIndex=Number.MAX_SAFE_INTEGER,n.startPosition={row:Number.MAX_SAFE_INTEGER,column:Number.MAX_SAFE_INTEGER}}else if(A.startIndex>this.startIndex)n.startIndex=this.startIndex,n.startPosition={...this.startPosition};return n}},_A=2,r=4,gA=4*r,F=5*r,J=2*r,W=2*r+2*J,S={row:0,column:0},b=Symbol("INTERNAL");function j(A){if(A!==b)throw Error("Illegal constructor")}Q(j,"assertInternal");function V(A){return!!A&&typeof A.row==="number"&&typeof A.column==="number"}Q(V,"isPoint");function uA(A){g=A}Q(uA,"setModule");var g;function P(A){try{return new FinalizationRegistry(A)}catch(n){console.error("Unsupported FinalizationRegistry:",n);return}}Q(P,"newFinalizer");var DA=P((A)=>{g._ts_lookahead_iterator_delete(A)}),ZA=class{static{Q(this,"LookaheadIterator")}[0]=0;language;positioned=!1;constructor(A,n,I){j(A),this[0]=n,this.language=I,DA?.register(this,n,this)}get currentTypeId(){return this.positioned?g._ts_lookahead_iterator_current_symbol(this[0]):null}get currentType(){let A=this.currentTypeId;if(A===null)return null;return this.language.types[A]??g.UTF8ToString(g._ts_language_symbol_name(this.language[0],A))}delete(){DA?.unregister(this),g._ts_lookahead_iterator_delete(this[0]),this[0]=0}reset(A,n){if(g._ts_lookahead_iterator_reset(this[0],A[0],n))return this.language=A,this.positioned=!1,!0;return!1}resetState(A){if(!g._ts_lookahead_iterator_reset_state(this[0],A))return!1;return this.positioned=!1,!0}[Symbol.iterator](){return{next:Q(()=>{this.positioned=Boolean(g._ts_lookahead_iterator_next(this[0]));let A=this.currentType;return A===null?{done:!0,value:""}:{done:!1,value:A}},"next")}}};function QA(A,n,I,e){let C=I-n,t=A.textCallback(n,e);if(t){n+=t.length;while(n<I){let B=A.textCallback(n,e);if(B&&B.length>0)n+=B.length,t+=B;else break}if(n>I)t=t.slice(0,C)}return t??""}Q(QA,"getText");var wA=P((A)=>{g._ts_tree_delete(A)}),zA=class A{static{Q(this,"Tree")}[0]=0;textCallback;language;constructor(n,I,e,C){j(n),this[0]=I,this.language=e,this.textCallback=C,wA?.register(this,I,this)}copy(){let n=g._ts_tree_copy(this[0]);return new A(b,n,this.language,this.textCallback)}delete(){wA?.unregister(this),g._ts_tree_delete(this[0]),this[0]=0}get rootNode(){return g._ts_tree_root_node_wasm(this[0]),u(this)}rootNodeWithOffset(n,I){let e=a+F;return g.setValue(e,n,"i32"),M(e+r,I),g._ts_tree_root_node_with_offset_wasm(this[0]),u(this)}edit(n){pA(n),g._ts_tree_edit_wasm(this[0])}walk(){return this.rootNode.walk()}getChangedRanges(n){if(!(n instanceof A))throw TypeError("Argument must be a Tree");g._ts_tree_get_changed_ranges_wasm(this[0],n[0]);let I=g.getValue(a,"i32"),e=g.getValue(a+r,"i32"),C=Array(I);if(I>0){let t=e;for(let B=0;B<I;B++)C[B]=Z(t),t+=W;g._free(e)}return C}getIncludedRanges(){g._ts_tree_included_ranges_wasm(this[0]);let n=g.getValue(a,"i32"),I=g.getValue(a+r,"i32"),e=Array(n);if(n>0){let C=I;for(let t=0;t<n;t++)e[t]=Z(C),C+=W;g._free(I)}return e}},yA=P((A)=>{h({handles:A}),g._ts_tree_cursor_delete_wasm(0)}),$A=class A{static{Q(this,"TreeCursor")}handles=[0,0,0,0];tree;constructor(n,I){j(n),this.tree=I,K(this),yA?.register(this,this.handles,this)}copy(){return h(this),g._ts_tree_cursor_copy_wasm(this.tree[0]),new A(b,this.tree)}delete(){yA?.unregister(this),h(this),g._ts_tree_cursor_delete_wasm(this.tree[0]),this.handles.fill(0)}get currentNode(){return h(this),g._ts_tree_cursor_current_node_wasm(this.tree[0]),u(this.tree)}get currentFieldId(){return h(this),g._ts_tree_cursor_current_field_id_wasm(this.tree[0])}get currentFieldName(){return this.tree.language.fields[this.currentFieldId]}get currentDepth(){return h(this),g._ts_tree_cursor_current_depth_wasm(this.tree[0])}get currentDescendantIndex(){return h(this),g._ts_tree_cursor_current_descendant_index_wasm(this.tree[0])}get nodeType(){return this.tree.language.types[this.nodeTypeId]||"ERROR"}get nodeTypeId(){return h(this),g._ts_tree_cursor_current_node_type_id_wasm(this.tree[0])}get nodeStateId(){return h(this),g._ts_tree_cursor_current_node_state_id_wasm(this.tree[0])}get nodeId(){return h(this),g._ts_tree_cursor_current_node_id_wasm(this.tree[0])}get nodeIsNamed(){return h(this),g._ts_tree_cursor_current_node_is_named_wasm(this.tree[0])===1}get nodeIsMissing(){return h(this),g._ts_tree_cursor_current_node_is_missing_wasm(this.tree[0])===1}get nodeText(){h(this);let n=g._ts_tree_cursor_start_index_wasm(this.tree[0]),I=g._ts_tree_cursor_end_index_wasm(this.tree[0]);g._ts_tree_cursor_start_position_wasm(this.tree[0]);let e=T(a);return QA(this.tree,n,I,e)}get startPosition(){return h(this),g._ts_tree_cursor_start_position_wasm(this.tree[0]),T(a)}get endPosition(){return h(this),g._ts_tree_cursor_end_position_wasm(this.tree[0]),T(a)}get startIndex(){return h(this),g._ts_tree_cursor_start_index_wasm(this.tree[0])}get endIndex(){return h(this),g._ts_tree_cursor_end_index_wasm(this.tree[0])}gotoFirstChild(){h(this);let n=g._ts_tree_cursor_goto_first_child_wasm(this.tree[0]);return K(this),n===1}gotoLastChild(){h(this);let n=g._ts_tree_cursor_goto_last_child_wasm(this.tree[0]);return K(this),n===1}gotoParent(){h(this);let n=g._ts_tree_cursor_goto_parent_wasm(this.tree[0]);return K(this),n===1}gotoNextSibling(){h(this);let n=g._ts_tree_cursor_goto_next_sibling_wasm(this.tree[0]);return K(this),n===1}gotoPreviousSibling(){h(this);let n=g._ts_tree_cursor_goto_previous_sibling_wasm(this.tree[0]);return K(this),n===1}gotoDescendant(n){h(this),g._ts_tree_cursor_goto_descendant_wasm(this.tree[0],n),K(this)}gotoFirstChildForIndex(n){h(this),g.setValue(a+gA,n,"i32");let I=g._ts_tree_cursor_goto_first_child_for_index_wasm(this.tree[0]);return K(this),I===1}gotoFirstChildForPosition(n){h(this),M(a+gA,n);let I=g._ts_tree_cursor_goto_first_child_for_position_wasm(this.tree[0]);return K(this),I===1}reset(n){D(n),h(this,a+F),g._ts_tree_cursor_reset_wasm(n.tree[0]),K(this),this.tree=n.tree}resetTo(n){h(this,a),h(n,a+gA),g._ts_tree_cursor_reset_to_wasm(this.tree[0],n.tree[0]),K(this),this.tree=n.tree}},An=class{static{Q(this,"Node")}[0]=0;_children;_namedChildren;constructor(A,{id:n,tree:I,startIndex:e,startPosition:C,other:t}){j(A),this[0]=t,this.id=n,this.tree=I,this.startIndex=e,this.startPosition=C}id;startIndex;startPosition;tree;get typeId(){return D(this),g._ts_node_symbol_wasm(this.tree[0])}get grammarId(){return D(this),g._ts_node_grammar_symbol_wasm(this.tree[0])}get type(){return this.tree.language.types[this.typeId]||"ERROR"}get grammarType(){return this.tree.language.types[this.grammarId]||"ERROR"}get isNamed(){return D(this),g._ts_node_is_named_wasm(this.tree[0])===1}get isExtra(){return D(this),g._ts_node_is_extra_wasm(this.tree[0])===1}get isError(){return D(this),g._ts_node_is_error_wasm(this.tree[0])===1}get isMissing(){return D(this),g._ts_node_is_missing_wasm(this.tree[0])===1}get hasChanges(){return D(this),g._ts_node_has_changes_wasm(this.tree[0])===1}get hasError(){return D(this),g._ts_node_has_error_wasm(this.tree[0])===1}get endIndex(){return D(this),g._ts_node_end_index_wasm(this.tree[0])}get endPosition(){return D(this),g._ts_node_end_point_wasm(this.tree[0]),T(a)}get text(){return QA(this.tree,this.startIndex,this.endIndex,this.startPosition)}get parseState(){return D(this),g._ts_node_parse_state_wasm(this.tree[0])}get nextParseState(){return D(this),g._ts_node_next_parse_state_wasm(this.tree[0])}equals(A){return this.tree===A.tree&&this.id===A.id}child(A){return D(this),g._ts_node_child_wasm(this.tree[0],A),u(this.tree)}namedChild(A){return D(this),g._ts_node_named_child_wasm(this.tree[0],A),u(this.tree)}childForFieldId(A){return D(this),g._ts_node_child_by_field_id_wasm(this.tree[0],A),u(this.tree)}childForFieldName(A){let n=this.tree.language.fields.indexOf(A);if(n!==-1)return this.childForFieldId(n);return null}fieldNameForChild(A){D(this);let n=g._ts_node_field_name_for_child_wasm(this.tree[0],A);if(!n)return null;return g.AsciiToString(n)}fieldNameForNamedChild(A){D(this);let n=g._ts_node_field_name_for_named_child_wasm(this.tree[0],A);if(!n)return null;return g.AsciiToString(n)}childrenForFieldName(A){let n=this.tree.language.fields.indexOf(A);if(n!==-1&&n!==0)return this.childrenForFieldId(n);return[]}childrenForFieldId(A){D(this),g._ts_node_children_by_field_id_wasm(this.tree[0],A);let n=g.getValue(a,"i32"),I=g.getValue(a+r,"i32"),e=Array(n);if(n>0){let C=I;for(let t=0;t<n;t++)e[t]=u(this.tree,C),C+=F;g._free(I)}return e}firstChildForIndex(A){D(this);let n=a+F;return g.setValue(n,A,"i32"),g._ts_node_first_child_for_byte_wasm(this.tree[0]),u(this.tree)}firstNamedChildForIndex(A){D(this);let n=a+F;return g.setValue(n,A,"i32"),g._ts_node_first_named_child_for_byte_wasm(this.tree[0]),u(this.tree)}get childCount(){return D(this),g._ts_node_child_count_wasm(this.tree[0])}get namedChildCount(){return D(this),g._ts_node_named_child_count_wasm(this.tree[0])}get firstChild(){return this.child(0)}get firstNamedChild(){return this.namedChild(0)}get lastChild(){return this.child(this.childCount-1)}get lastNamedChild(){return this.namedChild(this.namedChildCount-1)}get children(){if(!this._children){D(this),g._ts_node_children_wasm(this.tree[0]);let A=g.getValue(a,"i32"),n=g.getValue(a+r,"i32");if(this._children=Array(A),A>0){let I=n;for(let e=0;e<A;e++)this._children[e]=u(this.tree,I),I+=F;g._free(n)}}return this._children}get namedChildren(){if(!this._namedChildren){D(this),g._ts_node_named_children_wasm(this.tree[0]);let A=g.getValue(a,"i32"),n=g.getValue(a+r,"i32");if(this._namedChildren=Array(A),A>0){let I=n;for(let e=0;e<A;e++)this._namedChildren[e]=u(this.tree,I),I+=F;g._free(n)}}return this._namedChildren}descendantsOfType(A,n=S,I=S){if(!Array.isArray(A))A=[A];let e=[],C=this.tree.language.types;for(let s=0,d=C.length;s<d;s++)if(A.includes(C[s]))e.push(s);if(A.includes("ERROR"))e.push(65535);let t=g._malloc(r*e.length);for(let s=0,d=e.length;s<d;s++)g.setValue(t+s*r,e[s],"i32");D(this),g._ts_node_descendants_of_type_wasm(this.tree[0],t,e.length,n.row,n.column,I.row,I.column);let B=g.getValue(a,"i32"),E=g.getValue(a+r,"i32"),o=Array(B);if(B>0){let s=E;for(let d=0;d<B;d++)o[d]=u(this.tree,s),s+=F}return g._free(E),g._free(t),o}get nextSibling(){return D(this),g._ts_node_next_sibling_wasm(this.tree[0]),u(this.tree)}get previousSibling(){return D(this),g._ts_node_prev_sibling_wasm(this.tree[0]),u(this.tree)}get nextNamedSibling(){return D(this),g._ts_node_next_named_sibling_wasm(this.tree[0]),u(this.tree)}get previousNamedSibling(){return D(this),g._ts_node_prev_named_sibling_wasm(this.tree[0]),u(this.tree)}get descendantCount(){return D(this),g._ts_node_descendant_count_wasm(this.tree[0])}get parent(){return D(this),g._ts_node_parent_wasm(this.tree[0]),u(this.tree)}childWithDescendant(A){return D(this),D(A,1),g._ts_node_child_with_descendant_wasm(this.tree[0]),u(this.tree)}descendantForIndex(A,n=A){if(typeof A!=="number"||typeof n!=="number")throw Error("Arguments must be numbers");D(this);let I=a+F;return g.setValue(I,A,"i32"),g.setValue(I+r,n,"i32"),g._ts_node_descendant_for_index_wasm(this.tree[0]),u(this.tree)}namedDescendantForIndex(A,n=A){if(typeof A!=="number"||typeof n!=="number")throw Error("Arguments must be numbers");D(this);let I=a+F;return g.setValue(I,A,"i32"),g.setValue(I+r,n,"i32"),g._ts_node_named_descendant_for_index_wasm(this.tree[0]),u(this.tree)}descendantForPosition(A,n=A){if(!V(A)||!V(n))throw Error("Arguments must be {row, column} objects");D(this);let I=a+F;return M(I,A),M(I+J,n),g._ts_node_descendant_for_position_wasm(this.tree[0]),u(this.tree)}namedDescendantForPosition(A,n=A){if(!V(A)||!V(n))throw Error("Arguments must be {row, column} objects");D(this);let I=a+F;return M(I,A),M(I+J,n),g._ts_node_named_descendant_for_position_wasm(this.tree[0]),u(this.tree)}walk(){return D(this),g._ts_tree_cursor_new_wasm(this.tree[0]),new $A(b,this.tree)}edit(A){let{point:n,index:I}=A.editPoint(this.startPosition,this.startIndex);this.startPosition=n,this.startIndex=I}toString(){D(this);let A=g._ts_node_to_string_wasm(this.tree[0]),n=g.AsciiToString(A);return g._free(A),n}};function iA(A,n,I,e,C){for(let t=0,B=C.length;t<B;t++){let E=g.getValue(I,"i32");I+=r;let o=u(n,I);I+=F,C[t]={patternIndex:e,name:A.captureNames[E],node:o}}return I}Q(iA,"unmarshalCaptures");function D(A,n=0){let I=a+n*F;g.setValue(I,A.id,"i32"),I+=r,g.setValue(I,A.startIndex,"i32"),I+=r,g.setValue(I,A.startPosition.row,"i32"),I+=r,g.setValue(I,A.startPosition.column,"i32"),I+=r,g.setValue(I,A[0],"i32")}Q(D,"marshalNode");function u(A,n=a){let I=g.getValue(n,"i32");if(n+=r,I===0)return null;let e=g.getValue(n,"i32");n+=r;let C=g.getValue(n,"i32");n+=r;let t=g.getValue(n,"i32");n+=r;let B=g.getValue(n,"i32");return new An(b,{id:I,tree:A,startIndex:e,startPosition:{row:C,column:t},other:B})}Q(u,"unmarshalNode");function h({handles:A},n=a){g.setValue(n+0*r,A[0],"i32"),g.setValue(n+1*r,A[1],"i32"),g.setValue(n+2*r,A[2],"i32"),g.setValue(n+3*r,A[3],"i32")}Q(h,"marshalTreeCursor");function K({handles:A}){A[0]=g.getValue(a+0*r,"i32"),A[1]=g.getValue(a+1*r,"i32"),A[2]=g.getValue(a+2*r,"i32"),A[3]=g.getValue(a+3*r,"i32")}Q(K,"unmarshalTreeCursor");function M(A,n){g.setValue(A,n.row,"i32"),g.setValue(A+r,n.column,"i32")}Q(M,"marshalPoint");function T(A){return{row:g.getValue(A,"i32")>>>0,column:g.getValue(A+r,"i32")>>>0}}Q(T,"unmarshalPoint");function NA(A,n){M(A,n.startPosition),A+=J,M(A,n.endPosition),A+=J,g.setValue(A,n.startIndex,"i32"),A+=r,g.setValue(A,n.endIndex,"i32"),A+=r}Q(NA,"marshalRange");function Z(A){let n={};return n.startPosition=T(A),A+=J,n.endPosition=T(A),A+=J,n.startIndex=g.getValue(A,"i32")>>>0,A+=r,n.endIndex=g.getValue(A,"i32")>>>0,n}Q(Z,"unmarshalRange");function pA(A,n=a){M(n,A.startPosition),n+=J,M(n,A.oldEndPosition),n+=J,M(n,A.newEndPosition),n+=J,g.setValue(n,A.startIndex,"i32"),n+=r,g.setValue(n,A.oldEndIndex,"i32"),n+=r,g.setValue(n,A.newEndIndex,"i32"),n+=r}Q(pA,"marshalEdit");function RA(A){let n=g.getValue(A,"i32"),I=g.getValue(A+=r,"i32"),e=g.getValue(A+=r,"i32");return{major_version:n,minor_version:I,patch_version:e}}Q(RA,"unmarshalLanguageMetadata");var nn=/^tree_sitter_\w+$/,z=class A{static{Q(this,"Language")}[0]=0;types;fields;constructor(n,I){j(n),this[0]=I,this.types=Array(g._ts_language_symbol_count(this[0]));for(let e=0,C=this.types.length;e<C;e++)if(g._ts_language_symbol_type(this[0],e)<2)this.types[e]=g.UTF8ToString(g._ts_language_symbol_name(this[0],e));this.fields=Array(g._ts_language_field_count(this[0])+1);for(let e=0,C=this.fields.length;e<C;e++){let t=g._ts_language_field_name_for_id(this[0],e);if(t!==0)this.fields[e]=g.UTF8ToString(t);else this.fields[e]=null}}get name(){let n=g._ts_language_name(this[0]);if(n===0)return null;return g.UTF8ToString(n)}get abiVersion(){return g._ts_language_abi_version(this[0])}get metadata(){if(g._ts_language_metadata_wasm(this[0]),g.getValue(a,"i32")===0)return null;return RA(a+r)}get fieldCount(){return this.fields.length-1}get stateCount(){return g._ts_language_state_count(this[0])}fieldIdForName(n){let I=this.fields.indexOf(n);return I!==-1?I:null}fieldNameForId(n){return this.fields[n]??null}idForNodeType(n,I){let e=g.lengthBytesUTF8(n),C=g._malloc(e+1);g.stringToUTF8(n,C,e+1);let t=g._ts_language_symbol_for_name(this[0],C,e,I?1:0);return g._free(C),t||null}get nodeTypeCount(){return g._ts_language_symbol_count(this[0])}nodeTypeForId(n){let I=g._ts_language_symbol_name(this[0],n);return I?g.UTF8ToString(I):null}nodeTypeIsNamed(n){return g._ts_language_type_is_named_wasm(this[0],n)?!0:!1}nodeTypeIsVisible(n){return g._ts_language_type_is_visible_wasm(this[0],n)?!0:!1}get supertypes(){g._ts_language_supertypes_wasm(this[0]);let n=g.getValue(a,"i32"),I=g.getValue(a+r,"i32"),e=Array(n);if(n>0){let C=I;for(let t=0;t<n;t++)e[t]=g.getValue(C,"i16"),C+=_A}return e}subtypes(n){g._ts_language_subtypes_wasm(this[0],n);let I=g.getValue(a,"i32"),e=g.getValue(a+r,"i32"),C=Array(I);if(I>0){let t=e;for(let B=0;B<I;B++)C[B]=g.getValue(t,"i16"),t+=_A}return C}nextState(n,I){return g._ts_language_next_state(this[0],n,I)}lookaheadIterator(n){let I=g._ts_lookahead_iterator_new(this[0],n);if(I)return new ZA(b,I,this);return null}static async load(n){let I;if(n instanceof Uint8Array)I=n;else if(globalThis.process?.versions.node){let C=await import("fs/promises");I=await C.readFile(n)}else{let C=await fetch(n);if(!C.ok){let B=await C.text();throw Error(`Language.load failed with status ${C.status}.

${B}`)}let t=C.clone();try{I=await WebAssembly.compileStreaming(C)}catch(B){console.error("wasm streaming compile failed:",B),console.error("falling back to ArrayBuffer instantiation"),I=new Uint8Array(await t.arrayBuffer())}}let e=await g.loadWebAssemblyModule(I,{loadAsync:!0});return A.loadFromWasmExports(e,{sync:!1})}static loadFromWasmExports(n,{sync:I}){let e=Object.keys(n),C=e.find((B)=>nn.test(B)&&!B.includes("external_scanner_"));if(!C)throw console.log(`Couldn't find language function in Wasm file. Symbols:
${JSON.stringify(e,null,2)}`),Error(`Language.${I?"loadSync":"load"} failed: no language function found in Wasm file`);let t=n[C]();return new A(b,t)}static loadSync(n){let I=g.loadWebAssemblyModule(n,{loadAsync:!1});return A.loadFromWasmExports(I,{sync:!0})}};async function SA(moduleArg={}){var moduleRtn,Module=moduleArg,ENVIRONMENT_IS_WEB=typeof window=="object",ENVIRONMENT_IS_WORKER=typeof WorkerGlobalScope<"u",ENVIRONMENT_IS_NODE=typeof process=="object"&&process.versions?.node&&process.type!="renderer";if(ENVIRONMENT_IS_NODE){let{createRequire:A}=await import("module");var require=A("")}Module.currentQueryProgressCallback=null,Module.currentProgressCallback=null,Module.currentLogCallback=null,Module.currentParseCallback=null;var arguments_=[],thisProgram="./this.program",quit_=Q((A,n)=>{throw n},"quit_"),_scriptName="",scriptDirectory="";function locateFile(A){if(Module.locateFile)return Module.locateFile(A,scriptDirectory);return scriptDirectory+A}Q(locateFile,"locateFile");var readAsync,readBinary;if(ENVIRONMENT_IS_NODE){var fs=require("fs");if(_scriptName.startsWith("file:"))scriptDirectory=require("path").dirname(require("url").fileURLToPath(_scriptName))+"/";if(readBinary=Q((A)=>{A=isFileURI(A)?new URL(A):A;var n=fs.readFileSync(A);return n},"readBinary"),readAsync=Q(async(A,n=!0)=>{A=isFileURI(A)?new URL(A):A;var I=fs.readFileSync(A,n?void 0:"utf8");return I},"readAsync"),process.argv.length>1)thisProgram=process.argv[1].replace(/\\/g,"/");arguments_=process.argv.slice(2),quit_=Q((A,n)=>{throw process.exitCode=A,n},"quit_")}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){try{scriptDirectory=new URL(".",_scriptName).href}catch{}{if(ENVIRONMENT_IS_WORKER)readBinary=Q((A)=>{var n=new XMLHttpRequest;return n.open("GET",A,!1),n.responseType="arraybuffer",n.send(null),new Uint8Array(n.response)},"readBinary");readAsync=Q(async(A)=>{if(isFileURI(A))return new Promise((I,e)=>{var C=new XMLHttpRequest;C.open("GET",A,!0),C.responseType="arraybuffer",C.onload=()=>{if(C.status==200||C.status==0&&C.response){I(C.response);return}e(C.status)},C.onerror=e,C.send(null)});var n=await fetch(A,{credentials:"same-origin"});if(n.ok)return n.arrayBuffer();throw Error(n.status+" : "+n.url)},"readAsync")}}var out=console.log.bind(console),err=console.error.bind(console),dynamicLibraries=[],wasmBinary,ABORT=!1,EXITSTATUS,isFileURI=Q((A)=>A.startsWith("file://"),"isFileURI"),readyPromiseResolve,readyPromiseReject,wasmMemory,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64,HEAP64,HEAPU64,HEAP_DATA_VIEW,runtimeInitialized=!1;function updateMemoryViews(){var A=wasmMemory.buffer;Module.HEAP8=HEAP8=new Int8Array(A),Module.HEAP16=HEAP16=new Int16Array(A),Module.HEAPU8=HEAPU8=new Uint8Array(A),Module.HEAPU16=HEAPU16=new Uint16Array(A),Module.HEAP32=HEAP32=new Int32Array(A),Module.HEAPU32=HEAPU32=new Uint32Array(A),Module.HEAPF32=HEAPF32=new Float32Array(A),Module.HEAPF64=HEAPF64=new Float64Array(A),Module.HEAP64=HEAP64=new BigInt64Array(A),Module.HEAPU64=HEAPU64=new BigUint64Array(A),Module.HEAP_DATA_VIEW=HEAP_DATA_VIEW=new DataView(A),LE_HEAP_UPDATE()}Q(updateMemoryViews,"updateMemoryViews");function initMemory(){if(Module.wasmMemory)wasmMemory=Module.wasmMemory;else{var A=Module.INITIAL_MEMORY||33554432;wasmMemory=new WebAssembly.Memory({initial:A/65536,maximum:32768})}updateMemoryViews()}Q(initMemory,"initMemory");var __RELOC_FUNCS__=[];function preRun(){if(Module.preRun){if(typeof Module.preRun=="function")Module.preRun=[Module.preRun];while(Module.preRun.length)addOnPreRun(Module.preRun.shift())}callRuntimeCallbacks(onPreRuns)}Q(preRun,"preRun");function initRuntime(){runtimeInitialized=!0,callRuntimeCallbacks(__RELOC_FUNCS__),wasmExports.__wasm_call_ctors(),callRuntimeCallbacks(onPostCtors)}Q(initRuntime,"initRuntime");function preMain(){}Q(preMain,"preMain");function postRun(){if(Module.postRun){if(typeof Module.postRun=="function")Module.postRun=[Module.postRun];while(Module.postRun.length)addOnPostRun(Module.postRun.shift())}callRuntimeCallbacks(onPostRuns)}Q(postRun,"postRun");function abort(A){Module.onAbort?.(A),A="Aborted("+A+")",err(A),ABORT=!0,A+=". Build with -sASSERTIONS for more info.";var n=new WebAssembly.RuntimeError(A);throw readyPromiseReject?.(n),n}Q(abort,"abort");var wasmBinaryFile;function findWasmBinary(){if(Module.locateFile)return locateFile("web-tree-sitter.wasm");return new URL("web-tree-sitter.wasm","").href}Q(findWasmBinary,"findWasmBinary");function getBinarySync(A){if(A==wasmBinaryFile&&wasmBinary)return new Uint8Array(wasmBinary);if(readBinary)return readBinary(A);throw"both async and sync fetching of the wasm failed"}Q(getBinarySync,"getBinarySync");async function getWasmBinary(A){if(!wasmBinary)try{var n=await readAsync(A);return new Uint8Array(n)}catch{}return getBinarySync(A)}Q(getWasmBinary,"getWasmBinary");async function instantiateArrayBuffer(A,n){try{var I=await getWasmBinary(A),e=await WebAssembly.instantiate(I,n);return e}catch(C){err(`failed to asynchronously prepare wasm: ${C}`),abort(C)}}Q(instantiateArrayBuffer,"instantiateArrayBuffer");async function instantiateAsync(A,n,I){if(!A&&!isFileURI(n)&&!ENVIRONMENT_IS_NODE)try{var e=fetch(n,{credentials:"same-origin"}),C=await WebAssembly.instantiateStreaming(e,I);return C}catch(t){err(`wasm streaming compile failed: ${t}`),err("falling back to ArrayBuffer instantiation")}return instantiateArrayBuffer(n,I)}Q(instantiateAsync,"instantiateAsync");function getWasmImports(){return{env:wasmImports,wasi_snapshot_preview1:wasmImports,"GOT.mem":new Proxy(wasmImports,GOTHandler),"GOT.func":new Proxy(wasmImports,GOTHandler)}}Q(getWasmImports,"getWasmImports");async function createWasm(){function A(t,B){wasmExports=t.exports,wasmExports=relocateExports(wasmExports,1024);var E=getDylinkMetadata(B);if(E.neededDynlibs)dynamicLibraries=E.neededDynlibs.concat(dynamicLibraries);return mergeLibSymbols(wasmExports,"main"),LDSO.init(),loadDylibs(),__RELOC_FUNCS__.push(wasmExports.__wasm_apply_data_relocs),assignWasmExports(wasmExports),wasmExports}Q(A,"receiveInstance");function n(t){return A(t.instance,t.module)}Q(n,"receiveInstantiationResult");var I=getWasmImports();if(Module.instantiateWasm)return new Promise((t,B)=>{Module.instantiateWasm(I,(E,o)=>{t(A(E,o))})});wasmBinaryFile??=findWasmBinary();var e=await instantiateAsync(wasmBinary,wasmBinaryFile,I),C=n(e);return C}Q(createWasm,"createWasm");class ExitStatus{static{Q(this,"ExitStatus")}name="ExitStatus";constructor(A){this.message=`Program terminated with exit(${A})`,this.status=A}}var GOT={},currentModuleWeakSymbols=new Set([]),GOTHandler={get(A,n){var I=GOT[n];if(!I)I=GOT[n]=new WebAssembly.Global({value:"i32",mutable:!0});if(!currentModuleWeakSymbols.has(n))I.required=!0;return I}},LE_ATOMICS_NATIVE_BYTE_ORDER=[],LE_HEAP_LOAD_F32=Q((A)=>HEAP_DATA_VIEW.getFloat32(A,!0),"LE_HEAP_LOAD_F32"),LE_HEAP_LOAD_F64=Q((A)=>HEAP_DATA_VIEW.getFloat64(A,!0),"LE_HEAP_LOAD_F64"),LE_HEAP_LOAD_I16=Q((A)=>HEAP_DATA_VIEW.getInt16(A,!0),"LE_HEAP_LOAD_I16"),LE_HEAP_LOAD_I32=Q((A)=>HEAP_DATA_VIEW.getInt32(A,!0),"LE_HEAP_LOAD_I32"),LE_HEAP_LOAD_I64=Q((A)=>HEAP_DATA_VIEW.getBigInt64(A,!0),"LE_HEAP_LOAD_I64"),LE_HEAP_LOAD_U32=Q((A)=>HEAP_DATA_VIEW.getUint32(A,!0),"LE_HEAP_LOAD_U32"),LE_HEAP_STORE_F32=Q((A,n)=>HEAP_DATA_VIEW.setFloat32(A,n,!0),"LE_HEAP_STORE_F32"),LE_HEAP_STORE_F64=Q((A,n)=>HEAP_DATA_VIEW.setFloat64(A,n,!0),"LE_HEAP_STORE_F64"),LE_HEAP_STORE_I16=Q((A,n)=>HEAP_DATA_VIEW.setInt16(A,n,!0),"LE_HEAP_STORE_I16"),LE_HEAP_STORE_I32=Q((A,n)=>HEAP_DATA_VIEW.setInt32(A,n,!0),"LE_HEAP_STORE_I32"),LE_HEAP_STORE_I64=Q((A,n)=>HEAP_DATA_VIEW.setBigInt64(A,n,!0),"LE_HEAP_STORE_I64"),LE_HEAP_STORE_U32=Q((A,n)=>HEAP_DATA_VIEW.setUint32(A,n,!0),"LE_HEAP_STORE_U32"),callRuntimeCallbacks=Q((A)=>{while(A.length>0)A.shift()(Module)},"callRuntimeCallbacks"),onPostRuns=[],addOnPostRun=Q((A)=>onPostRuns.push(A),"addOnPostRun"),onPreRuns=[],addOnPreRun=Q((A)=>onPreRuns.push(A),"addOnPreRun"),UTF8Decoder=typeof TextDecoder<"u"?new TextDecoder:void 0,findStringEnd=Q((A,n,I,e)=>{var C=n+I;if(e)return C;while(A[n]&&!(n>=C))++n;return n},"findStringEnd"),UTF8ArrayToString=Q((A,n=0,I,e)=>{var C=findStringEnd(A,n,I,e);if(C-n>16&&A.buffer&&UTF8Decoder)return UTF8Decoder.decode(A.subarray(n,C));var t="";while(n<C){var B=A[n++];if(!(B&128)){t+=String.fromCharCode(B);continue}var E=A[n++]&63;if((B&224)==192){t+=String.fromCharCode((B&31)<<6|E);continue}var o=A[n++]&63;if((B&240)==224)B=(B&15)<<12|E<<6|o;else B=(B&7)<<18|E<<12|o<<6|A[n++]&63;if(B<65536)t+=String.fromCharCode(B);else{var s=B-65536;t+=String.fromCharCode(55296|s>>10,56320|s&1023)}}return t},"UTF8ArrayToString"),getDylinkMetadata=Q((A)=>{var n=0,I=0;function e(){return A[n++]}Q(e,"getU8");function C(){var U=0,q=1;while(!0){var dA=A[n++];if(U+=(dA&127)*q,q*=128,!(dA&128))break}return U}Q(C,"getLEB");function t(){var U=C();return n+=U,UTF8ArrayToString(A,n-U,U)}Q(t,"getString");function B(){var U=C(),q=[];while(U--)q.push(t());return q}Q(B,"getStringList");function E(U,q){if(U)throw Error(q)}if(Q(E,"failIf"),A instanceof WebAssembly.Module){var o=WebAssembly.Module.customSections(A,"dylink.0");E(o.length===0,"need dylink section"),A=new Uint8Array(o[0]),I=A.length}else{var s=new Uint32Array(new Uint8Array(A.subarray(0,24)).buffer),d=s[0]==1836278016||s[0]==6386541;E(!d,"need to see wasm magic number"),E(A[8]!==0,"need the dylink section to be first"),n=9;var l=C();I=n+l;var c=t();E(c!=="dylink.0")}var y={neededDynlibs:[],tlsExports:new Set,weakImports:new Set,runtimePaths:[]},p=1,L=2,_=3,f=4,w=5,N=256,m=3,Y=1;while(n<I){var k=e(),R=C();if(k===p)y.memorySize=C(),y.memoryAlign=C(),y.tableSize=C(),y.tableAlign=C();else if(k===L)y.neededDynlibs=B();else if(k===_){var H=C();while(H--){var x=t(),O=C();if(O&N)y.tlsExports.add(x)}}else if(k===f){var H=C();while(H--){var rn=t(),x=t(),O=C();if((O&m)==Y)y.weakImports.add(x)}}else if(k===w)y.runtimePaths=B();else n+=R}return y},"getDylinkMetadata");function getValue(A,n="i8"){if(n.endsWith("*"))n="*";switch(n){case"i1":return HEAP8[A];case"i8":return HEAP8[A];case"i16":return LE_HEAP_LOAD_I16((A>>1)*2);case"i32":return LE_HEAP_LOAD_I32((A>>2)*4);case"i64":return LE_HEAP_LOAD_I64((A>>3)*8);case"float":return LE_HEAP_LOAD_F32((A>>2)*4);case"double":return LE_HEAP_LOAD_F64((A>>3)*8);case"*":return LE_HEAP_LOAD_U32((A>>2)*4);default:abort(`invalid type for getValue: ${n}`)}}Q(getValue,"getValue");var newDSO=Q((A,n,I)=>{var e={refcount:1/0,name:A,exports:I,global:!0};if(LDSO.loadedLibsByName[A]=e,n!=null)LDSO.loadedLibsByHandle[n]=e;return e},"newDSO"),LDSO={loadedLibsByName:{},loadedLibsByHandle:{},init(){newDSO("__main__",0,wasmImports)}},___heap_base=82240,alignMemory=Q((A,n)=>Math.ceil(A/n)*n,"alignMemory"),getMemory=Q((A)=>{if(runtimeInitialized)return _calloc(A,1);var n=___heap_base,I=n+alignMemory(A,16);return ___heap_base=I,GOT.__heap_base.value=I,n},"getMemory"),isInternalSym=Q((A)=>["__cpp_exception","__c_longjmp","__wasm_apply_data_relocs","__dso_handle","__tls_size","__tls_align","__set_stack_limits","_emscripten_tls_init","__wasm_init_tls","__wasm_call_ctors","__start_em_asm","__stop_em_asm","__start_em_js","__stop_em_js"].includes(A)||A.startsWith("__em_js__"),"isInternalSym"),uleb128EncodeWithLen=Q((A)=>{let n=A.length;return[n%128|128,n>>7,...A]},"uleb128EncodeWithLen"),wasmTypeCodes={i:127,p:127,j:126,f:125,d:124,e:111},generateTypePack=Q((A)=>uleb128EncodeWithLen(Array.from(A,(n)=>{var I=wasmTypeCodes[n];return I})),"generateTypePack"),convertJsFunctionToWasm=Q((A,n)=>{var I=Uint8Array.of(0,97,115,109,1,0,0,0,1,...uleb128EncodeWithLen([1,96,...generateTypePack(n.slice(1)),...generateTypePack(n[0]==="v"?"":n[0])]),2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0),e=new WebAssembly.Module(I),C=new WebAssembly.Instance(e,{e:{f:A}}),t=C.exports.f;return t},"convertJsFunctionToWasm"),wasmTableMirror=[],wasmTable=new WebAssembly.Table({initial:31,element:"anyfunc"}),getWasmTableEntry=Q((A)=>{var n=wasmTableMirror[A];if(!n)wasmTableMirror[A]=n=wasmTable.get(A);return n},"getWasmTableEntry"),updateTableMap=Q((A,n)=>{if(functionsInTableMap)for(var I=A;I<A+n;I++){var e=getWasmTableEntry(I);if(e)functionsInTableMap.set(e,I)}},"updateTableMap"),functionsInTableMap,getFunctionAddress=Q((A)=>{if(!functionsInTableMap)functionsInTableMap=new WeakMap,updateTableMap(0,wasmTable.length);return functionsInTableMap.get(A)||0},"getFunctionAddress"),freeTableIndexes=[],getEmptyTableSlot=Q(()=>{if(freeTableIndexes.length)return freeTableIndexes.pop();return wasmTable.grow(1)},"getEmptyTableSlot"),setWasmTableEntry=Q((A,n)=>{wasmTable.set(A,n),wasmTableMirror[A]=wasmTable.get(A)},"setWasmTableEntry"),addFunction=Q((A,n)=>{var I=getFunctionAddress(A);if(I)return I;var e=getEmptyTableSlot();try{setWasmTableEntry(e,A)}catch(t){if(!(t instanceof TypeError))throw t;var C=convertJsFunctionToWasm(A,n);setWasmTableEntry(e,C)}return functionsInTableMap.set(A,e),e},"addFunction"),updateGOT=Q((A,n)=>{for(var I in A){if(isInternalSym(I))continue;var e=A[I];if(GOT[I]||=new WebAssembly.Global({value:"i32",mutable:!0}),n||GOT[I].value==0)if(typeof e=="function")GOT[I].value=addFunction(e);else if(typeof e=="number")GOT[I].value=e;else err(`unhandled export type for '${I}': ${typeof e}`)}},"updateGOT"),relocateExports=Q((A,n,I)=>{var e={};for(var C in A){var t=A[C];if(typeof t=="object")t=t.value;if(typeof t=="number")t+=n;e[C]=t}return updateGOT(e,I),e},"relocateExports"),isSymbolDefined=Q((A)=>{var n=wasmImports[A];if(!n||n.stub)return!1;return!0},"isSymbolDefined"),dynCall=Q((A,n,I=[],e=!1)=>{var C=getWasmTableEntry(n),t=C(...I);function B(E){return E}return Q(B,"convert"),B(t)},"dynCall"),stackSave=Q(()=>_emscripten_stack_get_current(),"stackSave"),stackRestore=Q((A)=>__emscripten_stack_restore(A),"stackRestore"),createInvokeFunction=Q((A)=>(n,...I)=>{var e=stackSave();try{return dynCall(A,n,I)}catch(C){if(stackRestore(e),C!==C+0)throw C;if(_setThrew(1,0),A[0]=="j")return 0n}},"createInvokeFunction"),resolveGlobalSymbol=Q((A,n=!1)=>{var I;if(isSymbolDefined(A))I=wasmImports[A];else if(A.startsWith("invoke_"))I=wasmImports[A]=createInvokeFunction(A.split("_")[1]);return{sym:I,name:A}},"resolveGlobalSymbol"),onPostCtors=[],addOnPostCtor=Q((A)=>onPostCtors.push(A),"addOnPostCtor"),UTF8ToString=Q((A,n,I)=>A?UTF8ArrayToString(HEAPU8,A,n,I):"","UTF8ToString"),loadWebAssemblyModule=Q((binary,flags,libName,localScope,handle)=>{var metadata=getDylinkMetadata(binary);function loadModule(){var memAlign=Math.pow(2,metadata.memoryAlign),memoryBase=metadata.memorySize?alignMemory(getMemory(metadata.memorySize+memAlign),memAlign):0,tableBase=metadata.tableSize?wasmTable.length:0;if(handle)HEAP8[handle+8]=1,LE_HEAP_STORE_U32((handle+12>>2)*4,memoryBase),LE_HEAP_STORE_I32((handle+16>>2)*4,metadata.memorySize),LE_HEAP_STORE_U32((handle+20>>2)*4,tableBase),LE_HEAP_STORE_I32((handle+24>>2)*4,metadata.tableSize);if(metadata.tableSize)wasmTable.grow(metadata.tableSize);var moduleExports;function resolveSymbol(A){var n=resolveGlobalSymbol(A).sym;if(!n&&localScope)n=localScope[A];if(!n)n=moduleExports[A];return n}Q(resolveSymbol,"resolveSymbol");var proxyHandler={get(A,n){switch(n){case"__memory_base":return memoryBase;case"__table_base":return tableBase}if(n in wasmImports&&!wasmImports[n].stub){var I=wasmImports[n];return I}if(!(n in A)){var e;A[n]=(...C)=>(e||=resolveSymbol(n),e(...C))}return A[n]}},proxy=new Proxy({},proxyHandler);currentModuleWeakSymbols=metadata.weakImports;var info={"GOT.mem":new Proxy({},GOTHandler),"GOT.func":new Proxy({},GOTHandler),env:proxy,wasi_snapshot_preview1:proxy};function postInstantiation(module,instance){if(updateTableMap(tableBase,metadata.tableSize),moduleExports=relocateExports(instance.exports,memoryBase),!flags.allowUndefined)reportUndefinedSymbols();function addEmAsm(addr,body){var args=[],arity=0;for(;arity<16;arity++)if(body.indexOf("$"+arity)!=-1)args.push("$"+arity);else break;args=args.join(",");var func=`(${args}) => { ${body} };`;ASM_CONSTS[start]=eval(func)}if(Q(addEmAsm,"addEmAsm"),"__start_em_asm"in moduleExports){var start=moduleExports.__start_em_asm,stop=moduleExports.__stop_em_asm;while(start<stop){var jsString=UTF8ToString(start);addEmAsm(start,jsString),start=HEAPU8.indexOf(0,start)+1}}function addEmJs(name,cSig,body){var jsArgs=[];if(cSig=cSig.slice(1,-1),cSig!="void"){cSig=cSig.split(",");for(var i in cSig){var jsArg=cSig[i].split(" ").pop();jsArgs.push(jsArg.replace("*",""))}}var func=`(${jsArgs}) => ${body};`;moduleExports[name]=eval(func)}Q(addEmJs,"addEmJs");for(var name in moduleExports)if(name.startsWith("__em_js__")){var start=moduleExports[name],jsString=UTF8ToString(start),parts=jsString.split("<::>");addEmJs(name.replace("__em_js__",""),parts[0],parts[1]),delete moduleExports[name]}var applyRelocs=moduleExports.__wasm_apply_data_relocs;if(applyRelocs)if(runtimeInitialized)applyRelocs();else __RELOC_FUNCS__.push(applyRelocs);var init=moduleExports.__wasm_call_ctors;if(init)if(runtimeInitialized)init();else addOnPostCtor(init);return moduleExports}if(Q(postInstantiation,"postInstantiation"),flags.loadAsync)return(async()=>{var A;if(binary instanceof WebAssembly.Module)A=new WebAssembly.Instance(binary,info);else({module:binary,instance:A}=await WebAssembly.instantiate(binary,info));return postInstantiation(binary,A)})();var module=binary instanceof WebAssembly.Module?binary:new WebAssembly.Module(binary),instance=new WebAssembly.Instance(module,info);return postInstantiation(module,instance)}if(Q(loadModule,"loadModule"),flags={...flags,rpath:{parentLibPath:libName,paths:metadata.runtimePaths}},flags.loadAsync)return metadata.neededDynlibs.reduce((A,n)=>A.then(()=>loadDynamicLibrary(n,flags,localScope)),Promise.resolve()).then(loadModule);return metadata.neededDynlibs.forEach((A)=>loadDynamicLibrary(A,flags,localScope)),loadModule()},"loadWebAssemblyModule"),mergeLibSymbols=Q((A,n)=>{for(var[I,e]of Object.entries(A)){let C=Q((B)=>{if(!isSymbolDefined(B))wasmImports[B]=e},"setImport");C(I);let t="__main_argc_argv";if(I=="main")C(t);if(I==t)C("main")}},"mergeLibSymbols"),asyncLoad=Q(async(A)=>{var n=await readAsync(A);return new Uint8Array(n)},"asyncLoad");function loadDynamicLibrary(A,n={global:!0,nodelete:!0},I,e){var C=LDSO.loadedLibsByName[A];if(C){if(!n.global){if(I)Object.assign(I,C.exports)}else if(!C.global)C.global=!0,mergeLibSymbols(C.exports,A);if(n.nodelete&&C.refcount!==1/0)C.refcount=1/0;if(C.refcount++,e)LDSO.loadedLibsByHandle[e]=C;return n.loadAsync?Promise.resolve(!0):!0}C=newDSO(A,e,"loading"),C.refcount=n.nodelete?1/0:1,C.global=n.global;function t(){if(e){var o=LE_HEAP_LOAD_U32((e+28>>2)*4),s=LE_HEAP_LOAD_U32((e+32>>2)*4);if(o&&s){var d=HEAP8.slice(o,o+s);return n.loadAsync?Promise.resolve(d):d}}var l=locateFile(A);if(n.loadAsync)return asyncLoad(l);if(!readBinary)throw Error(`${l}: file not found, and synchronous loading of external files is not available`);return readBinary(l)}Q(t,"loadLibData");function B(){if(n.loadAsync)return t().then((o)=>loadWebAssemblyModule(o,n,A,I,e));return loadWebAssemblyModule(t(),n,A,I,e)}Q(B,"getExports");function E(o){if(C.global)mergeLibSymbols(o,A);else if(I)Object.assign(I,o);C.exports=o}if(Q(E,"moduleLoaded"),n.loadAsync)return B().then((o)=>(E(o),!0));return E(B()),!0}Q(loadDynamicLibrary,"loadDynamicLibrary");var reportUndefinedSymbols=Q(()=>{for(var[A,n]of Object.entries(GOT))if(n.value==0){var I=resolveGlobalSymbol(A,!0).sym;if(!I&&!n.required)continue;if(typeof I=="function")n.value=addFunction(I,I.sig);else if(typeof I=="number")n.value=I;else throw Error(`bad export type for '${A}': ${typeof I}`)}},"reportUndefinedSymbols"),runDependencies=0,dependenciesFulfilled=null,removeRunDependency=Q((A)=>{if(runDependencies--,Module.monitorRunDependencies?.(runDependencies),runDependencies==0){if(dependenciesFulfilled){var n=dependenciesFulfilled;dependenciesFulfilled=null,n()}}},"removeRunDependency"),addRunDependency=Q((A)=>{runDependencies++,Module.monitorRunDependencies?.(runDependencies)},"addRunDependency"),loadDylibs=Q(async()=>{if(!dynamicLibraries.length){reportUndefinedSymbols();return}addRunDependency("loadDylibs");for(var A of dynamicLibraries)await loadDynamicLibrary(A,{loadAsync:!0,global:!0,nodelete:!0,allowUndefined:!0});reportUndefinedSymbols(),removeRunDependency("loadDylibs")},"loadDylibs"),noExitRuntime=!0;function setValue(A,n,I="i8"){if(I.endsWith("*"))I="*";switch(I){case"i1":HEAP8[A]=n;break;case"i8":HEAP8[A]=n;break;case"i16":LE_HEAP_STORE_I16((A>>1)*2,n);break;case"i32":LE_HEAP_STORE_I32((A>>2)*4,n);break;case"i64":LE_HEAP_STORE_I64((A>>3)*8,BigInt(n));break;case"float":LE_HEAP_STORE_F32((A>>2)*4,n);break;case"double":LE_HEAP_STORE_F64((A>>3)*8,n);break;case"*":LE_HEAP_STORE_U32((A>>2)*4,n);break;default:abort(`invalid type for setValue: ${I}`)}}Q(setValue,"setValue");var ___memory_base=new WebAssembly.Global({value:"i32",mutable:!1},1024),___stack_high=82240,___stack_low=16704,___stack_pointer=new WebAssembly.Global({value:"i32",mutable:!0},82240),___table_base=new WebAssembly.Global({value:"i32",mutable:!1},1),__abort_js=Q(()=>abort(""),"__abort_js");__abort_js.sig="v";var getHeapMax=Q(()=>2147483648,"getHeapMax"),growMemory=Q((A)=>{var n=wasmMemory.buffer.byteLength,I=(A-n+65535)/65536|0;try{return wasmMemory.grow(I),updateMemoryViews(),1}catch(e){}},"growMemory"),_emscripten_resize_heap=Q((A)=>{var n=HEAPU8.length;A>>>=0;var I=getHeapMax();if(A>I)return!1;for(var e=1;e<=4;e*=2){var C=n*(1+0.2/e);C=Math.min(C,A+100663296);var t=Math.min(I,alignMemory(Math.max(A,C),65536)),B=growMemory(t);if(B)return!0}return!1},"_emscripten_resize_heap");_emscripten_resize_heap.sig="ip";var _fd_close=Q((A)=>52,"_fd_close");_fd_close.sig="ii";var INT53_MAX=9007199254740992,INT53_MIN=-9007199254740992,bigintToI53Checked=Q((A)=>A<INT53_MIN||A>INT53_MAX?NaN:Number(A),"bigintToI53Checked");function _fd_seek(A,n,I,e){return n=bigintToI53Checked(n),70}Q(_fd_seek,"_fd_seek"),_fd_seek.sig="iijip";var printCharBuffers=[null,[],[]],printChar=Q((A,n)=>{var I=printCharBuffers[A];if(n===0||n===10)(A===1?out:err)(UTF8ArrayToString(I)),I.length=0;else I.push(n)},"printChar"),_fd_write=Q((A,n,I,e)=>{var C=0;for(var t=0;t<I;t++){var B=LE_HEAP_LOAD_U32((n>>2)*4),E=LE_HEAP_LOAD_U32((n+4>>2)*4);n+=8;for(var o=0;o<E;o++)printChar(A,HEAPU8[B+o]);C+=E}return LE_HEAP_STORE_U32((e>>2)*4,C),0},"_fd_write");_fd_write.sig="iippp";function _tree_sitter_log_callback(A,n){if(Module.currentLogCallback){let I=UTF8ToString(n);Module.currentLogCallback(I,A!==0)}}Q(_tree_sitter_log_callback,"_tree_sitter_log_callback");function _tree_sitter_parse_callback(A,n,I,e,C){let B=Module.currentParseCallback(n,{row:I,column:e});if(typeof B==="string")setValue(C,B.length,"i32"),stringToUTF16(B,A,10240);else setValue(C,0,"i32")}Q(_tree_sitter_parse_callback,"_tree_sitter_parse_callback");function _tree_sitter_progress_callback(A,n){if(Module.currentProgressCallback)return Module.currentProgressCallback({currentOffset:A,hasError:n});return!1}Q(_tree_sitter_progress_callback,"_tree_sitter_progress_callback");function _tree_sitter_query_progress_callback(A){if(Module.currentQueryProgressCallback)return Module.currentQueryProgressCallback({currentOffset:A});return!1}Q(_tree_sitter_query_progress_callback,"_tree_sitter_query_progress_callback");var runtimeKeepaliveCounter=0,keepRuntimeAlive=Q(()=>noExitRuntime||runtimeKeepaliveCounter>0,"keepRuntimeAlive"),_proc_exit=Q((A)=>{if(EXITSTATUS=A,!keepRuntimeAlive())Module.onExit?.(A),ABORT=!0;quit_(A,new ExitStatus(A))},"_proc_exit");_proc_exit.sig="vi";var exitJS=Q((A,n)=>{EXITSTATUS=A,_proc_exit(A)},"exitJS"),handleException=Q((A)=>{if(A instanceof ExitStatus||A=="unwind")return EXITSTATUS;quit_(1,A)},"handleException"),lengthBytesUTF8=Q((A)=>{var n=0;for(var I=0;I<A.length;++I){var e=A.charCodeAt(I);if(e<=127)n++;else if(e<=2047)n+=2;else if(e>=55296&&e<=57343)n+=4,++I;else n+=3}return n},"lengthBytesUTF8"),stringToUTF8Array=Q((A,n,I,e)=>{if(!(e>0))return 0;var C=I,t=I+e-1;for(var B=0;B<A.length;++B){var E=A.codePointAt(B);if(E<=127){if(I>=t)break;n[I++]=E}else if(E<=2047){if(I+1>=t)break;n[I++]=192|E>>6,n[I++]=128|E&63}else if(E<=65535){if(I+2>=t)break;n[I++]=224|E>>12,n[I++]=128|E>>6&63,n[I++]=128|E&63}else{if(I+3>=t)break;n[I++]=240|E>>18,n[I++]=128|E>>12&63,n[I++]=128|E>>6&63,n[I++]=128|E&63,B++}}return n[I]=0,I-C},"stringToUTF8Array"),stringToUTF8=Q((A,n,I)=>stringToUTF8Array(A,HEAPU8,n,I),"stringToUTF8"),stackAlloc=Q((A)=>__emscripten_stack_alloc(A),"stackAlloc"),stringToUTF8OnStack=Q((A)=>{var n=lengthBytesUTF8(A)+1,I=stackAlloc(n);return stringToUTF8(A,I,n),I},"stringToUTF8OnStack"),AsciiToString=Q((A)=>{var n="";while(!0){var I=HEAPU8[A++];if(!I)return n;n+=String.fromCharCode(I)}},"AsciiToString"),stringToUTF16=Q((A,n,I)=>{if(I??=2147483647,I<2)return 0;I-=2;var e=n,C=I<A.length*2?I/2:A.length;for(var t=0;t<C;++t){var B=A.charCodeAt(t);LE_HEAP_STORE_I16((n>>1)*2,B),n+=2}return LE_HEAP_STORE_I16((n>>1)*2,0),n-e},"stringToUTF16");LE_ATOMICS_NATIVE_BYTE_ORDER=new Int8Array(new Int16Array([1]).buffer)[0]===1?[(A)=>A,(A)=>A,void 0,(A)=>A]:[(A)=>A,(A)=>((A&65280)<<8|(A&255)<<24)>>16,void 0,(A)=>A>>24&255|A>>8&65280|(A&65280)<<8|(A&255)<<24];function LE_HEAP_UPDATE(){HEAPU16.unsigned=(A)=>A&65535,HEAPU32.unsigned=(A)=>A>>>0}Q(LE_HEAP_UPDATE,"LE_HEAP_UPDATE");{if(initMemory(),Module.noExitRuntime)noExitRuntime=Module.noExitRuntime;if(Module.print)out=Module.print;if(Module.printErr)err=Module.printErr;if(Module.dynamicLibraries)dynamicLibraries=Module.dynamicLibraries;if(Module.wasmBinary)wasmBinary=Module.wasmBinary;if(Module.arguments)arguments_=Module.arguments;if(Module.thisProgram)thisProgram=Module.thisProgram;if(Module.preInit){if(typeof Module.preInit=="function")Module.preInit=[Module.preInit];while(Module.preInit.length>0)Module.preInit.shift()()}}Module.setValue=setValue,Module.getValue=getValue,Module.UTF8ToString=UTF8ToString,Module.stringToUTF8=stringToUTF8,Module.lengthBytesUTF8=lengthBytesUTF8,Module.AsciiToString=AsciiToString,Module.stringToUTF16=stringToUTF16,Module.loadWebAssemblyModule=loadWebAssemblyModule,Module.LE_HEAP_STORE_I64=LE_HEAP_STORE_I64;var ASM_CONSTS={},_malloc,_calloc,_realloc,_free,_ts_range_edit,_memcmp,_ts_language_symbol_count,_ts_language_state_count,_ts_language_abi_version,_ts_language_name,_ts_language_field_count,_ts_language_next_state,_ts_language_symbol_name,_ts_language_symbol_for_name,_strncmp,_strlen,_ts_language_symbol_type,_ts_language_field_name_for_id,_ts_lookahead_iterator_new,_ts_lookahead_iterator_delete,_ts_lookahead_iterator_reset_state,_ts_lookahead_iterator_reset,_ts_lookahead_iterator_next,_ts_lookahead_iterator_current_symbol,_ts_point_edit,_ts_parser_delete,_ts_parser_reset,_ts_parser_set_language,_ts_parser_set_included_ranges,_ts_query_new,_ts_query_delete,_iswspace,_iswalnum,_ts_query_copy,_ts_query_pattern_count,_ts_query_capture_count,_ts_query_string_count,_ts_query_capture_name_for_id,_ts_query_capture_quantifier_for_id,_ts_query_string_value_for_id,_ts_query_predicates_for_pattern,_ts_query_start_byte_for_pattern,_ts_query_end_byte_for_pattern,_ts_query_is_pattern_rooted,_ts_query_is_pattern_non_local,_ts_query_is_pattern_guaranteed_at_step,_ts_query_disable_capture,_ts_query_disable_pattern,_ts_tree_copy,_ts_tree_delete,_ts_init,_ts_parser_new_wasm,_ts_parser_enable_logger_wasm,_ts_parser_parse_wasm,_ts_parser_included_ranges_wasm,_ts_language_type_is_named_wasm,_ts_language_type_is_visible_wasm,_ts_language_metadata_wasm,_ts_language_supertypes_wasm,_ts_language_subtypes_wasm,_ts_tree_root_node_wasm,_ts_tree_root_node_with_offset_wasm,_ts_tree_edit_wasm,_ts_tree_included_ranges_wasm,_ts_tree_get_changed_ranges_wasm,_ts_tree_cursor_new_wasm,_ts_tree_cursor_copy_wasm,_ts_tree_cursor_delete_wasm,_ts_tree_cursor_reset_wasm,_ts_tree_cursor_reset_to_wasm,_ts_tree_cursor_goto_first_child_wasm,_ts_tree_cursor_goto_last_child_wasm,_ts_tree_cursor_goto_first_child_for_index_wasm,_ts_tree_cursor_goto_first_child_for_position_wasm,_ts_tree_cursor_goto_next_sibling_wasm,_ts_tree_cursor_goto_previous_sibling_wasm,_ts_tree_cursor_goto_descendant_wasm,_ts_tree_cursor_goto_parent_wasm,_ts_tree_cursor_current_node_type_id_wasm,_ts_tree_cursor_current_node_state_id_wasm,_ts_tree_cursor_current_node_is_named_wasm,_ts_tree_cursor_current_node_is_missing_wasm,_ts_tree_cursor_current_node_id_wasm,_ts_tree_cursor_start_position_wasm,_ts_tree_cursor_end_position_wasm,_ts_tree_cursor_start_index_wasm,_ts_tree_cursor_end_index_wasm,_ts_tree_cursor_current_field_id_wasm,_ts_tree_cursor_current_depth_wasm,_ts_tree_cursor_current_descendant_index_wasm,_ts_tree_cursor_current_node_wasm,_ts_node_symbol_wasm,_ts_node_field_name_for_child_wasm,_ts_node_field_name_for_named_child_wasm,_ts_node_children_by_field_id_wasm,_ts_node_first_child_for_byte_wasm,_ts_node_first_named_child_for_byte_wasm,_ts_node_grammar_symbol_wasm,_ts_node_child_count_wasm,_ts_node_named_child_count_wasm,_ts_node_child_wasm,_ts_node_named_child_wasm,_ts_node_child_by_field_id_wasm,_ts_node_next_sibling_wasm,_ts_node_prev_sibling_wasm,_ts_node_next_named_sibling_wasm,_ts_node_prev_named_sibling_wasm,_ts_node_descendant_count_wasm,_ts_node_parent_wasm,_ts_node_child_with_descendant_wasm,_ts_node_descendant_for_index_wasm,_ts_node_named_descendant_for_index_wasm,_ts_node_descendant_for_position_wasm,_ts_node_named_descendant_for_position_wasm,_ts_node_start_point_wasm,_ts_node_end_point_wasm,_ts_node_start_index_wasm,_ts_node_end_index_wasm,_ts_node_to_string_wasm,_ts_node_children_wasm,_ts_node_named_children_wasm,_ts_node_descendants_of_type_wasm,_ts_node_is_named_wasm,_ts_node_has_changes_wasm,_ts_node_has_error_wasm,_ts_node_is_error_wasm,_ts_node_is_missing_wasm,_ts_node_is_extra_wasm,_ts_node_parse_state_wasm,_ts_node_next_parse_state_wasm,_ts_query_matches_wasm,_ts_query_captures_wasm,_memset,_memcpy,_memmove,_iswalpha,_iswblank,_iswdigit,_iswlower,_iswpunct,_iswupper,_iswxdigit,_memchr,_strcmp,_strncat,_strncpy,_towlower,_towupper,_setThrew,__emscripten_stack_restore,__emscripten_stack_alloc,_emscripten_stack_get_current,___wasm_apply_data_relocs;function assignWasmExports(A){Module._malloc=_malloc=A.malloc,Module._calloc=_calloc=A.calloc,Module._realloc=_realloc=A.realloc,Module._free=_free=A.free,Module._ts_range_edit=_ts_range_edit=A.ts_range_edit,Module._memcmp=_memcmp=A.memcmp,Module._ts_language_symbol_count=_ts_language_symbol_count=A.ts_language_symbol_count,Module._ts_language_state_count=_ts_language_state_count=A.ts_language_state_count,Module._ts_language_abi_version=_ts_language_abi_version=A.ts_language_abi_version,Module._ts_language_name=_ts_language_name=A.ts_language_name,Module._ts_language_field_count=_ts_language_field_count=A.ts_language_field_count,Module._ts_language_next_state=_ts_language_next_state=A.ts_language_next_state,Module._ts_language_symbol_name=_ts_language_symbol_name=A.ts_language_symbol_name,Module._ts_language_symbol_for_name=_ts_language_symbol_for_name=A.ts_language_symbol_for_name,Module._strncmp=_strncmp=A.strncmp,Module._strlen=_strlen=A.strlen,Module._ts_language_symbol_type=_ts_language_symbol_type=A.ts_language_symbol_type,Module._ts_language_field_name_for_id=_ts_language_field_name_for_id=A.ts_language_field_name_for_id,Module._ts_lookahead_iterator_new=_ts_lookahead_iterator_new=A.ts_lookahead_iterator_new,Module._ts_lookahead_iterator_delete=_ts_lookahead_iterator_delete=A.ts_lookahead_iterator_delete,Module._ts_lookahead_iterator_reset_state=_ts_lookahead_iterator_reset_state=A.ts_lookahead_iterator_reset_state,Module._ts_lookahead_iterator_reset=_ts_lookahead_iterator_reset=A.ts_lookahead_iterator_reset,Module._ts_lookahead_iterator_next=_ts_lookahead_iterator_next=A.ts_lookahead_iterator_next,Module._ts_lookahead_iterator_current_symbol=_ts_lookahead_iterator_current_symbol=A.ts_lookahead_iterator_current_symbol,Module._ts_point_edit=_ts_point_edit=A.ts_point_edit,Module._ts_parser_delete=_ts_parser_delete=A.ts_parser_delete,Module._ts_parser_reset=_ts_parser_reset=A.ts_parser_reset,Module._ts_parser_set_language=_ts_parser_set_language=A.ts_parser_set_language,Module._ts_parser_set_included_ranges=_ts_parser_set_included_ranges=A.ts_parser_set_included_ranges,Module._ts_query_new=_ts_query_new=A.ts_query_new,Module._ts_query_delete=_ts_query_delete=A.ts_query_delete,Module._iswspace=_iswspace=A.iswspace,Module._iswalnum=_iswalnum=A.iswalnum,Module._ts_query_copy=_ts_query_copy=A.ts_query_copy,Module._ts_query_pattern_count=_ts_query_pattern_count=A.ts_query_pattern_count,Module._ts_query_capture_count=_ts_query_capture_count=A.ts_query_capture_count,Module._ts_query_string_count=_ts_query_string_count=A.ts_query_string_count,Module._ts_query_capture_name_for_id=_ts_query_capture_name_for_id=A.ts_query_capture_name_for_id,Module._ts_query_capture_quantifier_for_id=_ts_query_capture_quantifier_for_id=A.ts_query_capture_quantifier_for_id,Module._ts_query_string_value_for_id=_ts_query_string_value_for_id=A.ts_query_string_value_for_id,Module._ts_query_predicates_for_pattern=_ts_query_predicates_for_pattern=A.ts_query_predicates_for_pattern,Module._ts_query_start_byte_for_pattern=_ts_query_start_byte_for_pattern=A.ts_query_start_byte_for_pattern,Module._ts_query_end_byte_for_pattern=_ts_query_end_byte_for_pattern=A.ts_query_end_byte_for_pattern,Module._ts_query_is_pattern_rooted=_ts_query_is_pattern_rooted=A.ts_query_is_pattern_rooted,Module._ts_query_is_pattern_non_local=_ts_query_is_pattern_non_local=A.ts_query_is_pattern_non_local,Module._ts_query_is_pattern_guaranteed_at_step=_ts_query_is_pattern_guaranteed_at_step=A.ts_query_is_pattern_guaranteed_at_step,Module._ts_query_disable_capture=_ts_query_disable_capture=A.ts_query_disable_capture,Module._ts_query_disable_pattern=_ts_query_disable_pattern=A.ts_query_disable_pattern,Module._ts_tree_copy=_ts_tree_copy=A.ts_tree_copy,Module._ts_tree_delete=_ts_tree_delete=A.ts_tree_delete,Module._ts_init=_ts_init=A.ts_init,Module._ts_parser_new_wasm=_ts_parser_new_wasm=A.ts_parser_new_wasm,Module._ts_parser_enable_logger_wasm=_ts_parser_enable_logger_wasm=A.ts_parser_enable_logger_wasm,Module._ts_parser_parse_wasm=_ts_parser_parse_wasm=A.ts_parser_parse_wasm,Module._ts_parser_included_ranges_wasm=_ts_parser_included_ranges_wasm=A.ts_parser_included_ranges_wasm,Module._ts_language_type_is_named_wasm=_ts_language_type_is_named_wasm=A.ts_language_type_is_named_wasm,Module._ts_language_type_is_visible_wasm=_ts_language_type_is_visible_wasm=A.ts_language_type_is_visible_wasm,Module._ts_language_metadata_wasm=_ts_language_metadata_wasm=A.ts_language_metadata_wasm,Module._ts_language_supertypes_wasm=_ts_language_supertypes_wasm=A.ts_language_supertypes_wasm,Module._ts_language_subtypes_wasm=_ts_language_subtypes_wasm=A.ts_language_subtypes_wasm,Module._ts_tree_root_node_wasm=_ts_tree_root_node_wasm=A.ts_tree_root_node_wasm,Module._ts_tree_root_node_with_offset_wasm=_ts_tree_root_node_with_offset_wasm=A.ts_tree_root_node_with_offset_wasm,Module._ts_tree_edit_wasm=_ts_tree_edit_wasm=A.ts_tree_edit_wasm,Module._ts_tree_included_ranges_wasm=_ts_tree_included_ranges_wasm=A.ts_tree_included_ranges_wasm,Module._ts_tree_get_changed_ranges_wasm=_ts_tree_get_changed_ranges_wasm=A.ts_tree_get_changed_ranges_wasm,Module._ts_tree_cursor_new_wasm=_ts_tree_cursor_new_wasm=A.ts_tree_cursor_new_wasm,Module._ts_tree_cursor_copy_wasm=_ts_tree_cursor_copy_wasm=A.ts_tree_cursor_copy_wasm,Module._ts_tree_cursor_delete_wasm=_ts_tree_cursor_delete_wasm=A.ts_tree_cursor_delete_wasm,Module._ts_tree_cursor_reset_wasm=_ts_tree_cursor_reset_wasm=A.ts_tree_cursor_reset_wasm,Module._ts_tree_cursor_reset_to_wasm=_ts_tree_cursor_reset_to_wasm=A.ts_tree_cursor_reset_to_wasm,Module._ts_tree_cursor_goto_first_child_wasm=_ts_tree_cursor_goto_first_child_wasm=A.ts_tree_cursor_goto_first_child_wasm,Module._ts_tree_cursor_goto_last_child_wasm=_ts_tree_cursor_goto_last_child_wasm=A.ts_tree_cursor_goto_last_child_wasm,Module._ts_tree_cursor_goto_first_child_for_index_wasm=_ts_tree_cursor_goto_first_child_for_index_wasm=A.ts_tree_cursor_goto_first_child_for_index_wasm,Module._ts_tree_cursor_goto_first_child_for_position_wasm=_ts_tree_cursor_goto_first_child_for_position_wasm=A.ts_tree_cursor_goto_first_child_for_position_wasm,Module._ts_tree_cursor_goto_next_sibling_wasm=_ts_tree_cursor_goto_next_sibling_wasm=A.ts_tree_cursor_goto_next_sibling_wasm,Module._ts_tree_cursor_goto_previous_sibling_wasm=_ts_tree_cursor_goto_previous_sibling_wasm=A.ts_tree_cursor_goto_previous_sibling_wasm,Module._ts_tree_cursor_goto_descendant_wasm=_ts_tree_cursor_goto_descendant_wasm=A.ts_tree_cursor_goto_descendant_wasm,Module._ts_tree_cursor_goto_parent_wasm=_ts_tree_cursor_goto_parent_wasm=A.ts_tree_cursor_goto_parent_wasm,Module._ts_tree_cursor_current_node_type_id_wasm=_ts_tree_cursor_current_node_type_id_wasm=A.ts_tree_cursor_current_node_type_id_wasm,Module._ts_tree_cursor_current_node_state_id_wasm=_ts_tree_cursor_current_node_state_id_wasm=A.ts_tree_cursor_current_node_state_id_wasm,Module._ts_tree_cursor_current_node_is_named_wasm=_ts_tree_cursor_current_node_is_named_wasm=A.ts_tree_cursor_current_node_is_named_wasm,Module._ts_tree_cursor_current_node_is_missing_wasm=_ts_tree_cursor_current_node_is_missing_wasm=A.ts_tree_cursor_current_node_is_missing_wasm,Module._ts_tree_cursor_current_node_id_wasm=_ts_tree_cursor_current_node_id_wasm=A.ts_tree_cursor_current_node_id_wasm,Module._ts_tree_cursor_start_position_wasm=_ts_tree_cursor_start_position_wasm=A.ts_tree_cursor_start_position_wasm,Module._ts_tree_cursor_end_position_wasm=_ts_tree_cursor_end_position_wasm=A.ts_tree_cursor_end_position_wasm,Module._ts_tree_cursor_start_index_wasm=_ts_tree_cursor_start_index_wasm=A.ts_tree_cursor_start_index_wasm,Module._ts_tree_cursor_end_index_wasm=_ts_tree_cursor_end_index_wasm=A.ts_tree_cursor_end_index_wasm,Module._ts_tree_cursor_current_field_id_wasm=_ts_tree_cursor_current_field_id_wasm=A.ts_tree_cursor_current_field_id_wasm,Module._ts_tree_cursor_current_depth_wasm=_ts_tree_cursor_current_depth_wasm=A.ts_tree_cursor_current_depth_wasm,Module._ts_tree_cursor_current_descendant_index_wasm=_ts_tree_cursor_current_descendant_index_wasm=A.ts_tree_cursor_current_descendant_index_wasm,Module._ts_tree_cursor_current_node_wasm=_ts_tree_cursor_current_node_wasm=A.ts_tree_cursor_current_node_wasm,Module._ts_node_symbol_wasm=_ts_node_symbol_wasm=A.ts_node_symbol_wasm,Module._ts_node_field_name_for_child_wasm=_ts_node_field_name_for_child_wasm=A.ts_node_field_name_for_child_wasm,Module._ts_node_field_name_for_named_child_wasm=_ts_node_field_name_for_named_child_wasm=A.ts_node_field_name_for_named_child_wasm,Module._ts_node_children_by_field_id_wasm=_ts_node_children_by_field_id_wasm=A.ts_node_children_by_field_id_wasm,Module._ts_node_first_child_for_byte_wasm=_ts_node_first_child_for_byte_wasm=A.ts_node_first_child_for_byte_wasm,Module._ts_node_first_named_child_for_byte_wasm=_ts_node_first_named_child_for_byte_wasm=A.ts_node_first_named_child_for_byte_wasm,Module._ts_node_grammar_symbol_wasm=_ts_node_grammar_symbol_wasm=A.ts_node_grammar_symbol_wasm,Module._ts_node_child_count_wasm=_ts_node_child_count_wasm=A.ts_node_child_count_wasm,Module._ts_node_named_child_count_wasm=_ts_node_named_child_count_wasm=A.ts_node_named_child_count_wasm,Module._ts_node_child_wasm=_ts_node_child_wasm=A.ts_node_child_wasm,Module._ts_node_named_child_wasm=_ts_node_named_child_wasm=A.ts_node_named_child_wasm,Module._ts_node_child_by_field_id_wasm=_ts_node_child_by_field_id_wasm=A.ts_node_child_by_field_id_wasm,Module._ts_node_next_sibling_wasm=_ts_node_next_sibling_wasm=A.ts_node_next_sibling_wasm,Module._ts_node_prev_sibling_wasm=_ts_node_prev_sibling_wasm=A.ts_node_prev_sibling_wasm,Module._ts_node_next_named_sibling_wasm=_ts_node_next_named_sibling_wasm=A.ts_node_next_named_sibling_wasm,Module._ts_node_prev_named_sibling_wasm=_ts_node_prev_named_sibling_wasm=A.ts_node_prev_named_sibling_wasm,Module._ts_node_descendant_count_wasm=_ts_node_descendant_count_wasm=A.ts_node_descendant_count_wasm,Module._ts_node_parent_wasm=_ts_node_parent_wasm=A.ts_node_parent_wasm,Module._ts_node_child_with_descendant_wasm=_ts_node_child_with_descendant_wasm=A.ts_node_child_with_descendant_wasm,Module._ts_node_descendant_for_index_wasm=_ts_node_descendant_for_index_wasm=A.ts_node_descendant_for_index_wasm,Module._ts_node_named_descendant_for_index_wasm=_ts_node_named_descendant_for_index_wasm=A.ts_node_named_descendant_for_index_wasm,Module._ts_node_descendant_for_position_wasm=_ts_node_descendant_for_position_wasm=A.ts_node_descendant_for_position_wasm,Module._ts_node_named_descendant_for_position_wasm=_ts_node_named_descendant_for_position_wasm=A.ts_node_named_descendant_for_position_wasm,Module._ts_node_start_point_wasm=_ts_node_start_point_wasm=A.ts_node_start_point_wasm,Module._ts_node_end_point_wasm=_ts_node_end_point_wasm=A.ts_node_end_point_wasm,Module._ts_node_start_index_wasm=_ts_node_start_index_wasm=A.ts_node_start_index_wasm,Module._ts_node_end_index_wasm=_ts_node_end_index_wasm=A.ts_node_end_index_wasm,Module._ts_node_to_string_wasm=_ts_node_to_string_wasm=A.ts_node_to_string_wasm,Module._ts_node_children_wasm=_ts_node_children_wasm=A.ts_node_children_wasm,Module._ts_node_named_children_wasm=_ts_node_named_children_wasm=A.ts_node_named_children_wasm,Module._ts_node_descendants_of_type_wasm=_ts_node_descendants_of_type_wasm=A.ts_node_descendants_of_type_wasm,Module._ts_node_is_named_wasm=_ts_node_is_named_wasm=A.ts_node_is_named_wasm,Module._ts_node_has_changes_wasm=_ts_node_has_changes_wasm=A.ts_node_has_changes_wasm,Module._ts_node_has_error_wasm=_ts_node_has_error_wasm=A.ts_node_has_error_wasm,Module._ts_node_is_error_wasm=_ts_node_is_error_wasm=A.ts_node_is_error_wasm,Module._ts_node_is_missing_wasm=_ts_node_is_missing_wasm=A.ts_node_is_missing_wasm,Module._ts_node_is_extra_wasm=_ts_node_is_extra_wasm=A.ts_node_is_extra_wasm,Module._ts_node_parse_state_wasm=_ts_node_parse_state_wasm=A.ts_node_parse_state_wasm,Module._ts_node_next_parse_state_wasm=_ts_node_next_parse_state_wasm=A.ts_node_next_parse_state_wasm,Module._ts_query_matches_wasm=_ts_query_matches_wasm=A.ts_query_matches_wasm,Module._ts_query_captures_wasm=_ts_query_captures_wasm=A.ts_query_captures_wasm,Module._memset=_memset=A.memset,Module._memcpy=_memcpy=A.memcpy,Module._memmove=_memmove=A.memmove,Module._iswalpha=_iswalpha=A.iswalpha,Module._iswblank=_iswblank=A.iswblank,Module._iswdigit=_iswdigit=A.iswdigit,Module._iswlower=_iswlower=A.iswlower,Module._iswpunct=_iswpunct=A.iswpunct,Module._iswupper=_iswupper=A.iswupper,Module._iswxdigit=_iswxdigit=A.iswxdigit,Module._memchr=_memchr=A.memchr,Module._strcmp=_strcmp=A.strcmp,Module._strncat=_strncat=A.strncat,Module._strncpy=_strncpy=A.strncpy,Module._towlower=_towlower=A.towlower,Module._towupper=_towupper=A.towupper,_setThrew=A.setThrew,__emscripten_stack_restore=A._emscripten_stack_restore,__emscripten_stack_alloc=A._emscripten_stack_alloc,_emscripten_stack_get_current=A.emscripten_stack_get_current,___wasm_apply_data_relocs=A.__wasm_apply_data_relocs}Q(assignWasmExports,"assignWasmExports");var wasmImports={__heap_base:___heap_base,__indirect_function_table:wasmTable,__memory_base:___memory_base,__stack_high:___stack_high,__stack_low:___stack_low,__stack_pointer:___stack_pointer,__table_base:___table_base,_abort_js:__abort_js,emscripten_resize_heap:_emscripten_resize_heap,fd_close:_fd_close,fd_seek:_fd_seek,fd_write:_fd_write,memory:wasmMemory,tree_sitter_log_callback:_tree_sitter_log_callback,tree_sitter_parse_callback:_tree_sitter_parse_callback,tree_sitter_progress_callback:_tree_sitter_progress_callback,tree_sitter_query_progress_callback:_tree_sitter_query_progress_callback};function callMain(A=[]){var n=resolveGlobalSymbol("main").sym;if(!n)return;A.unshift(thisProgram);var I=A.length,e=stackAlloc((I+1)*4),C=e;A.forEach((B)=>{LE_HEAP_STORE_U32((C>>2)*4,stringToUTF8OnStack(B)),C+=4}),LE_HEAP_STORE_U32((C>>2)*4,0);try{var t=n(I,e);return exitJS(t,!0),t}catch(B){return handleException(B)}}Q(callMain,"callMain");function run(A=arguments_){if(runDependencies>0){dependenciesFulfilled=run;return}if(preRun(),runDependencies>0){dependenciesFulfilled=run;return}function n(){if(Module.calledRun=!0,ABORT)return;initRuntime(),preMain(),readyPromiseResolve?.(Module),Module.onRuntimeInitialized?.();var I=Module.noInitialRun||!1;if(!I)callMain(A);postRun()}if(Q(n,"doRun"),Module.setStatus)Module.setStatus("Running..."),setTimeout(()=>{setTimeout(()=>Module.setStatus(""),1),n()},1);else n()}Q(run,"run");var wasmExports=await createWasm();if(run(),runtimeInitialized)moduleRtn=Module;else moduleRtn=new Promise((A,n)=>{readyPromiseResolve=A,readyPromiseReject=n});return moduleRtn}Q(SA,"Module");var In=SA,FA=null;async function kA(A){return FA??=await In(A)}Q(kA,"initializeBinding");function KA(){return!!FA}Q(KA,"checkModule");var a,eA,CA,hA=P((A)=>{g._ts_parser_delete(A[0]),g._free(A[1])}),AA=class{static{Q(this,"Parser")}[0]=0;[1]=0;logCallback=null;language=null;static async init(A){uA(await kA(A)),a=g._ts_init(),eA=g.getValue(a,"i32"),CA=g.getValue(a+r,"i32")}constructor(){this.initialize(),hA?.register(this,[this[0],this[1]],this)}initialize(){if(!KA())throw Error("cannot construct a Parser before calling `init()`");g._ts_parser_new_wasm(),this[0]=g.getValue(a,"i32"),this[1]=g.getValue(a+r,"i32")}delete(){hA?.unregister(this),g._ts_parser_delete(this[0]),g._free(this[1]),this[0]=0,this[1]=0}setLanguage(A){let n;if(!A)n=0,this.language=null;else if(A.constructor===z){n=A[0];let I=g._ts_language_abi_version(n);if(I<CA||eA<I)throw Error(`Incompatible language version ${I}. Compatibility range ${CA} through ${eA}.`);this.language=A}else throw Error("Argument must be a Language");return g._ts_parser_set_language(this[0],n),this}parse(A,n,I){if(typeof A==="string")g.currentParseCallback=(E)=>A.slice(E);else if(typeof A==="function")g.currentParseCallback=A;else throw Error("Argument must be a string or a function");if(I?.progressCallback)g.currentProgressCallback=I.progressCallback;else g.currentProgressCallback=null;if(this.logCallback)g.currentLogCallback=this.logCallback,g._ts_parser_enable_logger_wasm(this[0],1);else g.currentLogCallback=null,g._ts_parser_enable_logger_wasm(this[0],0);let e=0,C=0;if(I?.includedRanges){e=I.includedRanges.length,C=g._calloc(e,W);let E=C;for(let o=0;o<e;o++)NA(E,I.includedRanges[o]),E+=W}let t=g._ts_parser_parse_wasm(this[0],this[1],n?n[0]:0,C,e);if(!t)return g.currentParseCallback=null,g.currentLogCallback=null,g.currentProgressCallback=null,null;if(!this.language)throw Error("Parser must have a language to parse");let B=new zA(b,t,this.language,g.currentParseCallback);return g.currentParseCallback=null,g.currentLogCallback=null,g.currentProgressCallback=null,B}reset(){g._ts_parser_reset(this[0])}getIncludedRanges(){g._ts_parser_included_ranges_wasm(this[0]);let A=g.getValue(a,"i32"),n=g.getValue(a+r,"i32"),I=Array(A);if(A>0){let e=n;for(let C=0;C<A;C++)I[C]=Z(e),e+=W;g._free(n)}return I}setLogger(A){if(!A)this.logCallback=null;else if(typeof A!=="function")throw Error("Logger callback must be a function");else this.logCallback=A;return this}getLogger(){return this.logCallback}},gn=1,en=2,Cn=/[\w-]+/g,cn={Zero:0,ZeroOrOne:1,ZeroOrMore:2,One:3,OneOrMore:4},mA=Q((A)=>A.type==="capture","isCaptureStep"),BA=Q((A)=>A.type==="string","isStringStep"),G={Syntax:1,NodeName:2,FieldName:3,CaptureName:4,PatternStructure:5},X=class A extends Error{constructor(n,I,e,C){super(A.formatMessage(n,I));this.kind=n,this.info=I,this.index=e,this.length=C,this.name="QueryError"}kind;info;index;length;static{Q(this,"QueryError")}static formatMessage(n,I){switch(n){case G.NodeName:return`Bad node name '${I.word}'`;case G.FieldName:return`Bad field name '${I.word}'`;case G.CaptureName:return`Bad capture name @${I.word}`;case G.PatternStructure:return`Bad pattern structure at offset ${I.suffix}`;case G.Syntax:return`Bad syntax at offset ${I.suffix}`}}};function MA(A,n,I,e){if(A.length!==3)throw Error(`Wrong number of arguments to \`#${I}\` predicate. Expected 2, got ${A.length-1}`);if(!mA(A[1]))throw Error(`First argument of \`#${I}\` predicate must be a capture. Got "${A[1].value}"`);let C=I==="eq?"||I==="any-eq?",t=!I.startsWith("any-");if(mA(A[2])){let B=A[1].name,E=A[2].name;e[n].push((o)=>{let s=[],d=[];for(let c of o){if(c.name===B)s.push(c.node);if(c.name===E)d.push(c.node)}let l=Q((c,y,p)=>p?c.text===y.text:c.text!==y.text,"compare");return t?s.every((c)=>d.some((y)=>l(c,y,C))):s.some((c)=>d.some((y)=>l(c,y,C)))})}else{let B=A[1].name,E=A[2].value,o=Q((d)=>d.text===E,"matches"),s=Q((d)=>d.text!==E,"doesNotMatch");e[n].push((d)=>{let l=[];for(let y of d)if(y.name===B)l.push(y.node);let c=C?o:s;return t?l.every(c):l.some(c)})}}Q(MA,"parseAnyPredicate");function GA(A,n,I,e){if(A.length!==3)throw Error(`Wrong number of arguments to \`#${I}\` predicate. Expected 2, got ${A.length-1}.`);if(A[1].type!=="capture")throw Error(`First argument of \`#${I}\` predicate must be a capture. Got "${A[1].value}".`);if(A[2].type!=="string")throw Error(`Second argument of \`#${I}\` predicate must be a string. Got @${A[2].name}.`);let C=I==="match?"||I==="any-match?",t=!I.startsWith("any-"),B=A[1].name,E=new RegExp(A[2].value);e[n].push((o)=>{let s=[];for(let l of o)if(l.name===B)s.push(l.node.text);let d=Q((l,c)=>c?E.test(l):!E.test(l),"test");if(s.length===0)return!C;return t?s.every((l)=>d(l,C)):s.some((l)=>d(l,C))})}Q(GA,"parseMatchPredicate");function LA(A,n,I,e){if(A.length<2)throw Error(`Wrong number of arguments to \`#${I}\` predicate. Expected at least 1. Got ${A.length-1}.`);if(A[1].type!=="capture")throw Error(`First argument of \`#${I}\` predicate must be a capture. Got "${A[1].value}".`);let C=I==="any-of?",t=A[1].name,B=A.slice(2);if(!B.every(BA))throw Error(`Arguments to \`#${I}\` predicate must be strings.".`);let E=B.map((o)=>o.value);e[n].push((o)=>{let s=[];for(let d of o)if(d.name===t)s.push(d.node.text);if(s.length===0)return!C;return s.every((d)=>E.includes(d))===C})}Q(LA,"parseAnyOfPredicate");function UA(A,n,I,e,C){if(A.length<2||A.length>3)throw Error(`Wrong number of arguments to \`#${I}\` predicate. Expected 1 or 2. Got ${A.length-1}.`);if(!A.every(BA))throw Error(`Arguments to \`#${I}\` predicate must be strings.".`);let t=I==="is?"?e:C;if(!t[n])t[n]={};t[n][A[1].value]=A[2]?.value??null}Q(UA,"parseIsPredicate");function JA(A,n,I){if(A.length<2||A.length>3)throw Error(`Wrong number of arguments to \`#set!\` predicate. Expected 1 or 2. Got ${A.length-1}.`);if(!A.every(BA))throw Error('Arguments to `#set!` predicate must be strings.".');if(!I[n])I[n]={};I[n][A[1].value]=A[2]?.value??null}Q(JA,"parseSetDirective");function YA(A,n,I,e,C,t,B,E,o,s,d){if(n===gn){let l=e[I];t.push({type:"capture",name:l})}else if(n===en)t.push({type:"string",value:C[I]});else if(t.length>0){if(t[0].type!=="string")throw Error("Predicates must begin with a literal value");let l=t[0].value;switch(l){case"any-not-eq?":case"not-eq?":case"any-eq?":case"eq?":MA(t,A,l,B);break;case"any-not-match?":case"not-match?":case"any-match?":case"match?":GA(t,A,l,B);break;case"not-any-of?":case"any-of?":LA(t,A,l,B);break;case"is?":case"is-not?":UA(t,A,l,s,d);break;case"set!":JA(t,A,o);break;default:E[A].push({operator:l,operands:t.slice(1)})}t.length=0}}Q(YA,"parsePattern");function tA(A,n){return new TextEncoder().encodeInto(A,new Uint8Array(n)).read}Q(tA,"indexForByteOffset");var fA=P((A)=>{g._ts_query_delete(A)}),EA=class{static{Q(this,"Query")}[0]=0;exceededMatchLimit;textPredicates;source;captureNames;captureQuantifiers;predicates;setProperties;assertedProperties;refutedProperties;matchLimit;constructor(A,n){let I=g.lengthBytesUTF8(n),e=g._malloc(I+1);g.stringToUTF8(n,e,I+1);let C=g._ts_query_new(A[0],e,I,a,a+r);if(!C){let _=g.getValue(a+r,"i32"),f=g.getValue(a,"i32"),w=g.UTF8ToString(e,f).length,N=n.slice(w,w+100).split(`
`)[0],m=N.match(Cn)?.[0]??"";switch(g._free(e),_){case G.Syntax:throw new X(G.Syntax,{suffix:`${w}: '${N}'...`},w,0);case G.NodeName:throw new X(_,{word:m},w,m.length);case G.FieldName:throw new X(_,{word:m},w,m.length);case G.CaptureName:throw new X(_,{word:m},w,m.length);case G.PatternStructure:throw new X(_,{suffix:`${w}: '${N}'...`},w,0)}}let t=g._ts_query_string_count(C),B=g._ts_query_capture_count(C),E=g._ts_query_pattern_count(C),o=Array(B),s=Array(E),d=Array(t);for(let _=0;_<B;_++){let f=g._ts_query_capture_name_for_id(C,_,a),w=g.getValue(a,"i32");o[_]=g.UTF8ToString(f,w)}for(let _=0;_<E;_++){let f=Array(B);for(let w=0;w<B;w++){let N=g._ts_query_capture_quantifier_for_id(C,_,w);f[w]=N}s[_]=f}for(let _=0;_<t;_++){let f=g._ts_query_string_value_for_id(C,_,a),w=g.getValue(a,"i32");d[_]=g.UTF8ToString(f,w)}let l=Array(E),c=Array(E),y=Array(E),p=Array(E),L=Array(E);for(let _=0;_<E;_++){let f=g._ts_query_predicates_for_pattern(C,_,a),w=g.getValue(a,"i32");p[_]=[],L[_]=[];let N=[],m=f;for(let Y=0;Y<w;Y++){let k=g.getValue(m,"i32");m+=r;let R=g.getValue(m,"i32");m+=r,YA(_,k,R,o,d,N,L,p,l,c,y)}Object.freeze(L[_]),Object.freeze(p[_]),Object.freeze(l[_]),Object.freeze(c[_]),Object.freeze(y[_])}g._free(e),this[0]=C,this.captureNames=o,this.captureQuantifiers=s,this.textPredicates=L,this.source=n,this.predicates=p,this.setProperties=l,this.assertedProperties=c,this.refutedProperties=y,this.exceededMatchLimit=!1,fA?.register(this,C,this)}delete(){fA?.unregister(this),g._ts_query_delete(this[0]),this[0]=0}matches(A,n={}){let I=n.startPosition??S,e=n.endPosition??S,C=n.startIndex??0,t=n.endIndex??0,B=n.startContainingPosition??S,E=n.endContainingPosition??S,o=n.startContainingIndex??0,s=n.endContainingIndex??0,d=n.matchLimit??4294967295,l=n.maxStartDepth??4294967295,c=n.progressCallback;if(typeof d!=="number")throw Error("Arguments must be numbers");if(this.matchLimit=d,t!==0&&C>t)throw Error("`startIndex` cannot be greater than `endIndex`");if(e!==S&&(I.row>e.row||I.row===e.row&&I.column>e.column))throw Error("`startPosition` cannot be greater than `endPosition`");if(s!==0&&o>s)throw Error("`startContainingIndex` cannot be greater than `endContainingIndex`");if(E!==S&&(B.row>E.row||B.row===E.row&&B.column>E.column))throw Error("`startContainingPosition` cannot be greater than `endContainingPosition`");if(c)g.currentQueryProgressCallback=c;D(A),g._ts_query_matches_wasm(this[0],A.tree[0],I.row,I.column,e.row,e.column,C,t,B.row,B.column,E.row,E.column,o,s,d,l);let y=g.getValue(a,"i32"),p=g.getValue(a+r,"i32"),L=g.getValue(a+2*r,"i32"),_=Array(y);this.exceededMatchLimit=Boolean(L);let f=0,w=p;for(let N=0;N<y;N++){let m=g.getValue(w,"i32");w+=r;let Y=g.getValue(w,"i32");w+=r;let k=Array(Y);if(w=iA(this,A.tree,w,m,k),this.textPredicates[m].every((R)=>R(k))){_[f]={patternIndex:m,captures:k};let R=this.setProperties[m];_[f].setProperties=R;let H=this.assertedProperties[m];_[f].assertedProperties=H;let x=this.refutedProperties[m];_[f].refutedProperties=x,f++}}return _.length=f,g._free(p),g.currentQueryProgressCallback=null,_}captures(A,n={}){let I=n.startPosition??S,e=n.endPosition??S,C=n.startIndex??0,t=n.endIndex??0,B=n.startContainingPosition??S,E=n.endContainingPosition??S,o=n.startContainingIndex??0,s=n.endContainingIndex??0,d=n.matchLimit??4294967295,l=n.maxStartDepth??4294967295,c=n.progressCallback;if(typeof d!=="number")throw Error("Arguments must be numbers");if(this.matchLimit=d,t!==0&&C>t)throw Error("`startIndex` cannot be greater than `endIndex`");if(e!==S&&(I.row>e.row||I.row===e.row&&I.column>e.column))throw Error("`startPosition` cannot be greater than `endPosition`");if(s!==0&&o>s)throw Error("`startContainingIndex` cannot be greater than `endContainingIndex`");if(E!==S&&(B.row>E.row||B.row===E.row&&B.column>E.column))throw Error("`startContainingPosition` cannot be greater than `endContainingPosition`");if(c)g.currentQueryProgressCallback=c;D(A),g._ts_query_captures_wasm(this[0],A.tree[0],I.row,I.column,e.row,e.column,C,t,B.row,B.column,E.row,E.column,o,s,d,l);let y=g.getValue(a,"i32"),p=g.getValue(a+r,"i32"),L=g.getValue(a+2*r,"i32"),_=[];this.exceededMatchLimit=Boolean(L);let f=[],w=p;for(let N=0;N<y;N++){let m=g.getValue(w,"i32");w+=r;let Y=g.getValue(w,"i32");w+=r;let k=g.getValue(w,"i32");if(w+=r,f.length=Y,w=iA(this,A.tree,w,m,f),this.textPredicates[m].every((R)=>R(f))){let R=f[k],H=this.setProperties[m];R.setProperties=H;let x=this.assertedProperties[m];R.assertedProperties=x;let O=this.refutedProperties[m];R.refutedProperties=O,_.push(R)}}return g._free(p),g.currentQueryProgressCallback=null,_}predicatesForPattern(A){return this.predicates[A]}disableCapture(A){let n=g.lengthBytesUTF8(A),I=g._malloc(n+1);g.stringToUTF8(A,I,n+1),g._ts_query_disable_capture(this[0],I,n),g._free(I)}disablePattern(A){if(A>=this.predicates.length)throw Error(`Pattern index is ${A} but the pattern count is ${this.predicates.length}`);g._ts_query_disable_pattern(this[0],A)}didExceedMatchLimit(){return this.exceededMatchLimit}startIndexForPattern(A){if(A>=this.predicates.length)throw Error(`Pattern index is ${A} but the pattern count is ${this.predicates.length}`);let n=g._ts_query_start_byte_for_pattern(this[0],A);return tA(this.source,n)}endIndexForPattern(A){if(A>=this.predicates.length)throw Error(`Pattern index is ${A} but the pattern count is ${this.predicates.length}`);let n=g._ts_query_end_byte_for_pattern(this[0],A);return tA(this.source,n)}patternCount(){return g._ts_query_pattern_count(this[0])}captureIndexForName(A){return this.captureNames.indexOf(A)}isPatternRooted(A){return g._ts_query_is_pattern_rooted(this[0],A)===1}isPatternNonLocal(A){return g._ts_query_is_pattern_non_local(this[0],A)===1}isPatternGuaranteedAtStep(A){let n=g.lengthBytesUTF8(this.source.slice(0,A));return g._ts_query_is_pattern_guaranteed_at_step(this[0],n)===1}};var v={bash:{wasm:"tree-sitter-bash.wasm",title:"Bash",scope:"source.bash",fileTypes:["sh","bash","bashrc","bash_profile","bash_login","bash_logout","bash_aliases","PKGBUILD","APKBUILD","ebuild","eclass"],injectionRegex:"^(bash|sh|shell|shellscript)$",queries:{highlights:`; Highlights for Bash.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Words without a role (most
; arguments) are left plain.

(comment) @comment

; Keywords
; --------

[
  "if"
  "then"
  "elif"
  "else"
  "fi"
  "case"
  "esac"
] @keyword.conditional

[
  "for"
  "select"
  "in"
  "while"
  "until"
  "do"
  "done"
] @keyword.repeat

"function" @keyword.function

[
  "declare"
  "typeset"
  "export"
  "readonly"
  "local"
  "unset"
  "unsetenv"
] @keyword

; Literals
; --------

[
  (string)
  (raw_string)
  (ansi_c_string)
  (translated_string)
  (heredoc_body)
] @string

(regex) @string.regexp

[
  (heredoc_start)
  (heredoc_end)
] @label

(number) @number

(file_descriptor) @number

; Variables
; ---------

(variable_name) @variable

(special_variable_name) @variable.builtin

((variable_name) @variable.builtin
  (#any-of? @variable.builtin
    "BASH" "BASHOPTS" "BASHPID" "BASH_ALIASES" "BASH_ARGC" "BASH_ARGV"
    "BASH_ARGV0" "BASH_CMDS" "BASH_COMMAND" "BASH_LINENO" "BASH_REMATCH"
    "BASH_SOURCE" "BASH_SUBSHELL" "BASH_VERSINFO" "BASH_VERSION" "CDPATH"
    "COLUMNS" "COMP_CWORD" "COMP_LINE" "COMP_POINT" "COMP_WORDS" "COMPREPLY"
    "DIRSTACK" "EPOCHREALTIME" "EPOCHSECONDS" "EUID" "FUNCNAME" "GROUPS" "HOME"
    "HOSTNAME" "HOSTTYPE" "IFS" "LINENO" "LINES" "MACHTYPE" "OLDPWD" "OPTARG"
    "OPTERR" "OPTIND" "OSTYPE" "PATH" "PIPESTATUS" "PPID" "PS1" "PS2" "PS3"
    "PS4" "PWD" "RANDOM" "REPLY" "SECONDS" "SHELL" "SHELLOPTS" "SHLVL" "SRANDOM"
    "UID"))

; Options passed to a command: -x, --flag, --name=value
(command
  argument: (word) @variable.parameter
  (#match? @variable.parameter "^-"))

; Functions and commands
; ----------------------

(command_name
  (word) @function.call)

((command_name
  (word) @function.builtin)
  (#any-of? @function.builtin
    "." ":" "[" "alias" "bg" "bind" "break" "builtin" "caller" "cd" "command"
    "compgen" "complete" "compopt" "continue" "coproc" "dirs" "disown" "echo"
    "enable" "eval" "exec" "exit" "false" "fc" "fg" "getopts" "hash" "help"
    "history" "jobs" "kill" "let" "logout" "mapfile" "popd" "printf" "pushd"
    "pwd" "read" "readarray" "return" "set" "shift" "shopt" "source" "suspend"
    "test" "time" "times" "trap" "true" "type" "ulimit" "umask" "unalias"
    "wait"))

(function_definition
  name: (word) @function)

; Operators
; ---------

[
  "|"
  "|&"
  "&&"
  "||"
  "!"
  "="
  "+="
  "=="
  "!="
  "=~"
  "<"
  ">"
  ">>"
  "&>"
  "&>>"
  "<&"
  ">&"
  ">|"
  "<>"
  "<<"
  "<<-"
  "<<<"
] @operator

(test_operator) @operator

(binary_expression
  operator: _ @operator)

(unary_expression
  operator: _ @operator)

(postfix_expression
  operator: _ @operator)

(ternary_expression
  [
    "?"
    ":"
  ] @operator)

(expansion
  [
    "#"
    "!"
  ] @operator)

(expansion
  operator: _ @operator)

; Punctuation
; -----------

[
  "("
  ")"
  "(("
  "{"
  "}"
  "["
  "]"
  "[["
  "]]"
] @punctuation.bracket

[
  ";"
  "&"
  ";;"
  ";&"
  ";;&"
] @punctuation.delimiter

(simple_expansion
  "$" @punctuation.special)

(expansion
  [
    "\${"
    "}"
  ] @punctuation.special)

(command_substitution
  [
    "$("
    ")"
    "\`"
  ] @punctuation.special)

(arithmetic_expansion
  [
    "$(("
    "$["
    ")"
    "]"
  ] @punctuation.special)

(process_substitution
  [
    "<("
    ">("
    ")"
  ] @punctuation.special)

(translated_string
  "$\\"" @punctuation.special)
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

; The script given to \`bash -c\`, \`sh -c\` and \`eval\` in single quotes.
((command
  name: (command_name
    (word) @_command)
  argument: (word) @_flag
  .
  argument: (raw_string) @injection.content)
  (#any-of? @_command "bash" "sh")
  (#eq? @_flag "-c")
  (#offset! @injection.content 0 1 0 -1)
  (#set! injection.language "bash"))

((command
  name: (command_name
    (word) @_command)
  .
  argument: (raw_string) @injection.content)
  (#eq? @_command "eval")
  (#offset! @injection.content 0 1 0 -1)
  (#set! injection.language "bash"))
`,locals:`; Scopes
; ------

; Variables are global unless declared with \`local\` (or \`declare\` and
; \`typeset\`) inside a function, so a function body is a scope only for those.
[
  (program)
  (function_definition)
] @local.scope

; Definitions
; -----------

(variable_assignment
  name: (variable_name) @local.definition.var)

(variable_assignment
  name: (subscript
    name: (variable_name) @local.definition.var))

(declaration_command
  (variable_name) @local.definition.var)

(for_statement
  variable: (variable_name) @local.definition.var)

(function_definition
  name: (word) @local.definition.function)

; References
; ----------

(simple_expansion
  (variable_name) @local.reference)

(expansion
  (variable_name) @local.reference)

(expansion
  (subscript
    name: (variable_name) @local.reference))

; Bare names in arithmetic: $(( n + 1 )), (( i++ )).
(arithmetic_expansion
  (variable_name) @local.reference)

(arithmetic_command
  (variable_name) @local.reference)

([
  (binary_expression)
  (unary_expression)
  (postfix_expression)
  (ternary_expression)
  (parenthesized_expression)
]
  (variable_name) @local.reference)
`,tags:`; Functions a script defines, and the commands it runs.

(function_definition
  name: (word) @name) @definition.function

(command
  name: (command_name
    (word) @name)) @reference.call
`,folds:`[
  (function_definition)
  (compound_statement)
  (subshell)
  (if_statement)
  (elif_clause)
  (else_clause)
  (while_statement)
  (for_statement)
  (c_style_for_statement)
  (do_group)
  (case_statement)
  (case_item)
  (command_substitution)
  (heredoc_body)
  (array)
] @fold
`}},batch:{wasm:"tree-sitter-batch.wasm",title:"Batch",scope:"source.batch",fileTypes:["bat","cmd","btm","BAT","CMD"],injectionRegex:"^(batch|bat|cmd|dosbatch|winbatch)$",queries:{highlights:`; Highlights for Windows batch files.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Batch is case-insensitive, so
; name matches spell out both cases.

(comment) @comment

(label) @label

; Keywords
; --------

[
  "if"
  "else"
  "not"
  "exist"
  "defined"
  "errorlevel"
  "cmdextversion"
  "/i"
] @keyword.conditional

[
  "for"
  "in"
  "do"
  "/d"
  "/r"
  "/l"
  "/f"
] @keyword.repeat

"set" @keyword

(set_statement
  option: _ @keyword)

"@" @keyword

; Commands
; --------

(command_name) @function.call

((command_name) @function.builtin
  (#match? @function.builtin "^([Aa][Ss][Ss][Oo][Cc]|[Bb][Rr][Ee][Aa][Kk]|[Cc][Aa][Ll][Ll]|[Cc][Dd]|[Cc][Hh][Dd][Ii][Rr]|[Cc][Ll][Ss]|[Cc][Oo][Ll][Oo][Rr]|[Cc][Oo][Pp][Yy]|[Dd][Aa][Tt][Ee]|[Dd][Ee][Ll]|[Dd][Ii][Rr]|[Ee][Cc][Hh][Oo]|[Ee][Nn][Dd][Ll][Oo][Cc][Aa][Ll]|[Ee][Rr][Aa][Ss][Ee]|[Ee][Xx][Ii][Tt]|[Ff][Tt][Yy][Pp][Ee]|[Gg][Oo][Tt][Oo]|[Mm][Dd]|[Mm][Kk][Dd][Ii][Rr]|[Mm][Kk][Ll][Ii][Nn][Kk]|[Mm][Oo][Vv][Ee]|[Pp][Aa][Tt][Hh]|[Pp][Aa][Uu][Ss][Ee]|[Pp][Oo][Pp][Dd]|[Pp][Rr][Oo][Mm][Pp][Tt]|[Pp][Uu][Ss][Hh][Dd]|[Rr][Dd]|[Rr][Ee][Nn]|[Rr][Ee][Nn][Aa][Mm][Ee]|[Rr][Mm][Dd][Ii][Rr]|[Ss][Ee][Tt][Ll][Oo][Cc][Aa][Ll]|[Ss][Hh][Ii][Ff][Tt]|[Ss][Tt][Aa][Rr][Tt]|[Tt][Ii][Mm][Ee]|[Tt][Ii][Tt][Ll][Ee]|[Tt][Yy][Pp][Ee]|[Vv][Ee][Rr]|[Vv][Ee][Rr][Ii][Ff][Yy]|[Vv][Oo][Ll])$"))

; \`echo.\`, \`echo:\` and \`echo(\` print their text.
((command_name) @function.builtin
  (#match? @function.builtin "^[Ee][Cc][Hh][Oo][.:(/\\\\\\\\,;=+\\\\[\\\\]]"))

; \`goto label\`, \`call :label\`
(command
  name: (command_name) @function.builtin
  .
  argument: (word) @label
  (#match? @function.builtin "^([Gg][Oo][Tt][Oo]|[Cc][Aa][Ll][Ll])$"))

; Options passed to a command: /b, -x, --flag
(command
  argument: (word) @variable.parameter
  (#match? @variable.parameter "^(/|-)"))

; Literals
; --------

[
  (string)
  (value)
] @string

(command_string) @string.special

(escape_sequence) @string.escape

; Variables
; ---------

(variable_name) @variable

[
  (variable)
  (delayed_variable)
] @variable

[
  (parameter)
  (for_variable)
] @variable.parameter

; Operators
; ---------

[
  "&"
  "&&"
  "||"
  "|"
  ">"
  ">>"
  "<"
  ">&"
  "<&"
  "=="
  "equ"
  "neq"
  "lss"
  "leq"
  "gtr"
  "geq"
  "="
] @operator

; Punctuation
; -----------

[
  "("
  ")"
] @punctuation.bracket

[
  ","
  ";"
] @punctuation.delimiter
`,tags:`; Labels are the subroutines and jump targets of a script; \`call :label\` and
; \`goto label\` refer to them.

(label) @name @definition.function

(command
  name: (command_name) @_name
  .
  argument: (word) @name
  (#match? @_name "^([Gg][Oo][Tt][Oo]|[Cc][Aa][Ll][Ll])$")
  (#match? @name "^:?[^:]")) @reference.call
`,folds:`[
  (block)
  (for_statement)
  (if_statement)
] @fold
`}},c:{wasm:"tree-sitter-c.wasm",title:"C",scope:"source.c",fileTypes:["c","h"],injectionRegex:"^(c|h)$",queries:{highlights:`; Highlights for C.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

; Identifiers
; -----------

(identifier) @variable

; Names in all caps are usually macros or enum constants.
((identifier) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]*$"))

(type_identifier) @type

(field_identifier) @property

(statement_identifier) @label

(enumerator
  name: (identifier) @constant)

(parameter_declaration
  declarator: (identifier) @variable.parameter)

(parameter_declaration
  declarator: (pointer_declarator
    declarator: (identifier) @variable.parameter))

(parameter_declaration
  declarator: (array_declarator
    declarator: (identifier) @variable.parameter))

; Types
; -----

[
  (primitive_type)
  (sized_type_specifier)
  (bitint_type)
] @type.builtin

; The usual typedefs from the standard and POSIX headers.
((type_identifier) @type.builtin
  (#match? @type.builtin "^(u?int(8|16|32|64|max|ptr)?_t|u?int_(least|fast)(8|16|32|64)_t|size_t|ssize_t|ptrdiff_t|wchar_t|char(8|16|32)_t|max_align_t|nullptr_t|off_t|FILE|va_list)$"))

(macro_type_specifier
  name: (identifier) @function.macro)

; Functions
; ---------

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (field_expression
    field: (field_identifier) @function.call))

(function_declarator
  declarator: (identifier) @function)

(function_declarator
  declarator: (parenthesized_declarator
    (pointer_declarator
      declarator: (field_identifier) @property)))

; Attributes and macros used as modifiers
; ---------------------------------------

(attribute
  prefix: (identifier) @attribute)

(attribute
  name: (identifier) @attribute)

(macro_modifier) @attribute

(macro_modifier
  function: (identifier) @attribute)

; Preprocessor
; ------------

[
  "#include"
  "#define"
  "#if"
  "#ifdef"
  "#ifndef"
  "#elif"
  "#elifdef"
  "#elifndef"
  (preproc_else)
  (preproc_endif)
  (preproc_directive)
] @keyword.directive

"defined" @keyword.directive

(preproc_def
  name: (identifier) @constant.macro)

(preproc_function_def
  name: (identifier) @function.macro)

(preproc_params
  (identifier) @variable.parameter)

(preproc_ifdef
  name: (identifier) @constant.macro)

(preproc_elifdef
  name: (identifier) @constant.macro)

(preproc_defined
  name: (identifier) @constant.macro)

; Keywords
; --------

[
  "typedef"
  "struct"
  "union"
  "enum"
  "_Generic"
  "static_assert"
  "_Static_assert"
  "__declspec"
  "__based"
  "__extension__"
] @keyword

[
  (storage_class_specifier)
  (type_qualifier)
  (ms_call_modifier)
  (ms_pointer_modifier)
] @keyword.modifier

[
  "__attribute__"
  "__attribute"
  "alignas"
  "_Alignas"
] @keyword.modifier

[
  "typeof"
  "typeof_unqual"
  "__typeof"
  "__typeof__"
  "__typeof_unqual"
  "__typeof_unqual__"
  "_Atomic"
  "_BitInt"
] @keyword.type

[
  "sizeof"
  "alignof"
  "_Alignof"
  "__alignof"
  "__alignof__"
  "__real"
  "__real__"
  "__imag"
  "__imag__"
] @keyword.operator

(asm_expression
  [
    "asm"
    "__asm"
    "__asm__"
  ] @keyword)

(asm_expression
  qualifier: _ @keyword.modifier)

[
  "if"
  "else"
  "switch"
  "case"
  "default"
] @keyword.conditional

[
  "while"
  "do"
  "for"
] @keyword.repeat

[
  "break"
  "continue"
  "goto"
] @keyword

"return" @keyword.return

(linkage_specification
  "extern" @keyword.modifier)

; Literals
; --------

[
  (string_literal)
  (system_lib_string)
] @string

(system_lib_string) @string.special.path

(preproc_include
  path: (string_literal) @string.special.path)

(escape_sequence) @string.escape

(char_literal) @character

(number_literal) @number

((number_literal) @number.float
  (#match? @number.float "^(0[xX][0-9a-fA-F']*\\\\.?[0-9a-fA-F']*[pP]|[0-9']*\\\\.|[0-9']+[eE]|\\\\.[0-9])"))

[
  (true)
  (false)
] @boolean

(null) @constant.builtin

(comment) @comment

((comment) @comment.documentation
  (#match? @comment.documentation "^(///[^/]|/\\\\*\\\\*[^*/])"))

; Operators and punctuation
; -------------------------

[
  "="
  "*="
  "/="
  "%="
  "+="
  "-="
  "<<="
  ">>="
  "&="
  "^="
  "|="
  "||"
  "&&"
  "|"
  "^"
  "&"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "<<"
  ">>"
  "+"
  "-"
  "*"
  "/"
  "%"
  "!"
  "~"
  "++"
  "--"
  "->"
  "?"
] @operator

(conditional_expression
  ":" @operator)

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ";"
  ","
  "."
  ":"
  "::"
  "..."
] @punctuation.delimiter

(field_expression
  "." @operator)
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

(asm_expression
  template: [
    (string_literal)
    (concatenated_string)
  ] @injection.content
  (#set! injection.language "asm"))
`,locals:`; Scopes
; ------

[
  (translation_unit)
  (function_definition)
  (compound_statement)
  (for_statement)
  (if_statement)
  (while_statement)
  (do_statement)
  (switch_statement)
  (statement_expression)
] @local.scope

; Definitions
; -----------

(declaration
  declarator: (identifier) @local.definition.var)

(declaration
  declarator: (init_declarator
    declarator: (identifier) @local.definition.var))

(declaration
  declarator: (pointer_declarator
    declarator: (identifier) @local.definition.var))

(declaration
  declarator: (init_declarator
    declarator: (pointer_declarator
      declarator: (identifier) @local.definition.var)))

(declaration
  declarator: (array_declarator
    declarator: (identifier) @local.definition.var))

(declaration
  declarator: (init_declarator
    declarator: (array_declarator
      declarator: (identifier) @local.definition.var)))

(parameter_declaration
  declarator: (identifier) @local.definition.parameter)

(parameter_declaration
  declarator: (pointer_declarator
    declarator: (identifier) @local.definition.parameter))

(parameter_declaration
  declarator: (array_declarator
    declarator: (identifier) @local.definition.parameter))

(function_definition
  declarator: (function_declarator
    declarator: (identifier) @local.definition.function))

(function_definition
  declarator: (pointer_declarator
    declarator: (function_declarator
      declarator: (identifier) @local.definition.function)))

(type_definition
  declarator: (type_identifier) @local.definition.type)

(enumerator
  name: (identifier) @local.definition.constant)

(labeled_statement
  label: (statement_identifier) @local.definition.label)

(preproc_def
  name: (identifier) @local.definition.macro)

(preproc_function_def
  name: (identifier) @local.definition.macro)

; References
; ----------

(identifier) @local.reference

(type_identifier) @local.reference
`,tags:`(function_definition
  declarator: (function_declarator
    declarator: (identifier) @name)) @definition.function

(function_definition
  declarator: (pointer_declarator
    declarator: (function_declarator
      declarator: (identifier) @name))) @definition.function

(declaration
  declarator: (function_declarator
    declarator: (identifier) @name)) @definition.function

(declaration
  declarator: (pointer_declarator
    declarator: (function_declarator
      declarator: (identifier) @name))) @definition.function

(type_definition
  declarator: (type_identifier) @name) @definition.type

(struct_specifier
  name: (type_identifier) @name
  body: (_)) @definition.class

(union_specifier
  name: (type_identifier) @name
  body: (_)) @definition.class

(enum_specifier
  name: (type_identifier) @name
  body: (_)) @definition.type

(enumerator
  name: (identifier) @name) @definition.constant

(field_declaration
  declarator: (field_identifier) @name) @definition.field

(preproc_def
  name: (identifier) @name) @definition.macro

(preproc_function_def
  name: (identifier) @name) @definition.macro

(call_expression
  function: [
    (identifier) @name
    (field_expression
      field: (field_identifier) @name)
  ]) @reference.call
`,folds:`[
  (compound_statement)
  (field_declaration_list)
  (enumerator_list)
  (initializer_list)
  (declaration_list)
  (parameter_list)
  (argument_list)
  (case_statement)
  (preproc_function_def)
  (comment)
] @fold
`}},cmake:{wasm:"tree-sitter-cmake.wasm",title:"CMake",scope:"source.cmake",fileTypes:["cmake","CMakeLists.txt"],injectionRegex:"^cmake$",queries:{highlights:`;; Highlights for CMake.
;;
;; When several patterns match a node, the last one wins, so general patterns
;; come first and more specific ones after them.
;;
;; Command names ignore case. Builtin commands are matched in lower and upper
;; case, the two ways they are written in practice.

; Commands
; --------

(command
  name: (identifier) @function.call)

((command
  name: (identifier) @function.builtin)
  (#match? @function.builtin "^(add_compile_definitions|add_compile_options|add_custom_command|add_custom_target|add_definitions|add_dependencies|add_executable|add_library|add_link_options|add_subdirectory|add_test|aux_source_directory|break|build_command|cmake_file_api|cmake_host_system_information|cmake_instrumentation|cmake_language|cmake_minimum_required|cmake_parse_arguments|cmake_path|cmake_pkg_config|cmake_policy|configure_file|continue|create_test_sourcelist|ctest_build|ctest_configure|ctest_coverage|ctest_empty_binary_directory|ctest_memcheck|ctest_read_custom_files|ctest_run_script|ctest_sleep|ctest_start|ctest_submit|ctest_test|ctest_update|ctest_upload|define_property|enable_language|enable_testing|execute_process|export|file|find_file|find_library|find_package|find_path|find_program|fltk_wrap_ui|get_cmake_property|get_directory_property|get_filename_component|get_property|get_source_file_property|get_target_property|get_test_property|include|include_directories|include_external_msproject|include_guard|include_regular_expression|install|link_directories|link_libraries|list|load_cache|mark_as_advanced|math|message|option|project|qt_wrap_cpp|qt_wrap_ui|remove_definitions|return|separate_arguments|set|set_directory_properties|set_property|set_source_files_properties|set_target_properties|set_tests_properties|site_name|source_group|string|target_compile_definitions|target_compile_features|target_compile_options|target_include_directories|target_link_directories|target_link_libraries|target_link_options|target_precompile_headers|target_sources|try_compile|try_run|unset|variable_watch|ADD_COMPILE_DEFINITIONS|ADD_COMPILE_OPTIONS|ADD_CUSTOM_COMMAND|ADD_CUSTOM_TARGET|ADD_DEFINITIONS|ADD_DEPENDENCIES|ADD_EXECUTABLE|ADD_LIBRARY|ADD_LINK_OPTIONS|ADD_SUBDIRECTORY|ADD_TEST|AUX_SOURCE_DIRECTORY|BREAK|BUILD_COMMAND|CMAKE_FILE_API|CMAKE_HOST_SYSTEM_INFORMATION|CMAKE_INSTRUMENTATION|CMAKE_LANGUAGE|CMAKE_MINIMUM_REQUIRED|CMAKE_PARSE_ARGUMENTS|CMAKE_PATH|CMAKE_PKG_CONFIG|CMAKE_POLICY|CONFIGURE_FILE|CONTINUE|CREATE_TEST_SOURCELIST|CTEST_BUILD|CTEST_CONFIGURE|CTEST_COVERAGE|CTEST_EMPTY_BINARY_DIRECTORY|CTEST_MEMCHECK|CTEST_READ_CUSTOM_FILES|CTEST_RUN_SCRIPT|CTEST_SLEEP|CTEST_START|CTEST_SUBMIT|CTEST_TEST|CTEST_UPDATE|CTEST_UPLOAD|DEFINE_PROPERTY|ENABLE_LANGUAGE|ENABLE_TESTING|EXECUTE_PROCESS|EXPORT|FILE|FIND_FILE|FIND_LIBRARY|FIND_PACKAGE|FIND_PATH|FIND_PROGRAM|FLTK_WRAP_UI|GET_CMAKE_PROPERTY|GET_DIRECTORY_PROPERTY|GET_FILENAME_COMPONENT|GET_PROPERTY|GET_SOURCE_FILE_PROPERTY|GET_TARGET_PROPERTY|GET_TEST_PROPERTY|INCLUDE|INCLUDE_DIRECTORIES|INCLUDE_EXTERNAL_MSPROJECT|INCLUDE_GUARD|INCLUDE_REGULAR_EXPRESSION|INSTALL|LINK_DIRECTORIES|LINK_LIBRARIES|LIST|LOAD_CACHE|MARK_AS_ADVANCED|MATH|MESSAGE|OPTION|PROJECT|QT_WRAP_CPP|QT_WRAP_UI|REMOVE_DEFINITIONS|RETURN|SEPARATE_ARGUMENTS|SET|SET_DIRECTORY_PROPERTIES|SET_PROPERTY|SET_SOURCE_FILES_PROPERTIES|SET_TARGET_PROPERTIES|SET_TESTS_PROPERTIES|SITE_NAME|SOURCE_GROUP|STRING|TARGET_COMPILE_DEFINITIONS|TARGET_COMPILE_FEATURES|TARGET_COMPILE_OPTIONS|TARGET_INCLUDE_DIRECTORIES|TARGET_LINK_DIRECTORIES|TARGET_LINK_LIBRARIES|TARGET_LINK_OPTIONS|TARGET_PRECOMPILE_HEADERS|TARGET_SOURCES|TRY_COMPILE|TRY_RUN|UNSET|VARIABLE_WATCH)$"))

((command
  name: (identifier) @keyword.return)
  (#match? @keyword.return "^(return|RETURN)$"))

((command
  name: (identifier) @keyword.repeat)
  (#match? @keyword.repeat "^(break|continue|BREAK|CONTINUE)$"))

[
  "if"
  "elseif"
  "else"
  "endif"
] @keyword.conditional

[
  "foreach"
  "endforeach"
  "while"
  "endwhile"
] @keyword.repeat

[
  "function"
  "endfunction"
  "macro"
  "endmacro"
] @keyword.function

[
  "block"
  "endblock"
] @keyword

; Arguments
; ---------

(quoted_argument) @string

(bracket_argument) @string

[
  (escape_sequence)
  (line_continuation)
] @string.escape

((unquoted_argument) @boolean
  (#match? @boolean "^(ON|OFF|TRUE|FALSE|YES|NO|IGNORE|NOTFOUND|[A-Za-z0-9_]*-NOTFOUND)$"))

; Conditions in if(), elseif() and while().
((if_command
  arguments: (argument_list
    (unquoted_argument) @keyword.operator))
  (#match? @keyword.operator "^(NOT|AND|OR|COMMAND|POLICY|TARGET|TEST|DEFINED|EXISTS|IS_READABLE|IS_WRITABLE|IS_EXECUTABLE|IS_NEWER_THAN|IS_DIRECTORY|IS_SYMLINK|IS_ABSOLUTE|MATCHES|LESS|GREATER|EQUAL|LESS_EQUAL|GREATER_EQUAL|STRLESS|STRGREATER|STREQUAL|STRLESS_EQUAL|STRGREATER_EQUAL|VERSION_LESS|VERSION_GREATER|VERSION_EQUAL|VERSION_LESS_EQUAL|VERSION_GREATER_EQUAL|IN_LIST|PATH_EQUAL)$"))

((elseif_command
  arguments: (argument_list
    (unquoted_argument) @keyword.operator))
  (#match? @keyword.operator "^(NOT|AND|OR|COMMAND|POLICY|TARGET|TEST|DEFINED|EXISTS|IS_READABLE|IS_WRITABLE|IS_EXECUTABLE|IS_NEWER_THAN|IS_DIRECTORY|IS_SYMLINK|IS_ABSOLUTE|MATCHES|LESS|GREATER|EQUAL|LESS_EQUAL|GREATER_EQUAL|STRLESS|STRGREATER|STREQUAL|STRLESS_EQUAL|STRGREATER_EQUAL|VERSION_LESS|VERSION_GREATER|VERSION_EQUAL|VERSION_LESS_EQUAL|VERSION_GREATER_EQUAL|IN_LIST|PATH_EQUAL)$"))

((while_command
  arguments: (argument_list
    (unquoted_argument) @keyword.operator))
  (#match? @keyword.operator "^(NOT|AND|OR|COMMAND|POLICY|TARGET|TEST|DEFINED|EXISTS|IS_READABLE|IS_WRITABLE|IS_EXECUTABLE|IS_NEWER_THAN|IS_DIRECTORY|IS_SYMLINK|IS_ABSOLUTE|MATCHES|LESS|GREATER|EQUAL|LESS_EQUAL|GREATER_EQUAL|STRLESS|STRGREATER|STREQUAL|STRLESS_EQUAL|STRGREATER_EQUAL|VERSION_LESS|VERSION_GREATER|VERSION_EQUAL|VERSION_LESS_EQUAL|VERSION_GREATER_EQUAL|IN_LIST|PATH_EQUAL)$"))

((argument_group
  (unquoted_argument) @keyword.operator)
  (#match? @keyword.operator "^(NOT|AND|OR|COMMAND|POLICY|TARGET|TEST|DEFINED|EXISTS|IS_READABLE|IS_WRITABLE|IS_EXECUTABLE|IS_NEWER_THAN|IS_DIRECTORY|IS_SYMLINK|IS_ABSOLUTE|MATCHES|LESS|GREATER|EQUAL|LESS_EQUAL|GREATER_EQUAL|STRLESS|STRGREATER|STREQUAL|STRLESS_EQUAL|STRGREATER_EQUAL|VERSION_LESS|VERSION_GREATER|VERSION_EQUAL|VERSION_LESS_EQUAL|VERSION_GREATER_EQUAL|IN_LIST|PATH_EQUAL)$"))

(foreach_command
  arguments: (argument_list
    .
    (unquoted_argument) @variable))

((foreach_command
  arguments: (argument_list
    (_)
    (unquoted_argument) @keyword))
  (#match? @keyword "^(IN|LISTS|ITEMS|ZIP_LISTS|RANGE)$"))

; The variable that set(), unset() and option() name.
((command
  name: (identifier) @_name
  arguments: (argument_list
    .
    (unquoted_argument) @variable))
  (#match? @_name "^(set|unset|option|SET|UNSET|OPTION)$"))

; Definitions
; -----------

(function_command
  arguments: (argument_list
    (_)
    (unquoted_argument) @variable.parameter))

(macro_command
  arguments: (argument_list
    (_)
    (unquoted_argument) @variable.parameter))

(function_command
  arguments: (argument_list
    .
    (unquoted_argument) @function))

(macro_command
  arguments: (argument_list
    .
    (unquoted_argument) @function.macro))

; Variable references
; -------------------

(variable) @variable

((variable) @variable.builtin
  (#match? @variable.builtin "^(CMAKE|PROJECT)_"))

(variable_reference
  [
    "\${"
    "$ENV{"
    "$CACHE{"
    "}"
  ] @punctuation.special)

; Generator expressions
; ---------------------

; The name: the first piece of text, unless a nested expression comes first.
(generator_expression
  .
  (genex_text) @function.builtin)

(generator_expression
  [
    "$<"
    ">"
  ] @punctuation.special)

(generator_expression
  [
    ":"
    ","
  ] @punctuation.delimiter)

; Comments and punctuation
; ------------------------

[
  (line_comment)
  (bracket_comment)
] @comment

[
  "("
  ")"
] @punctuation.bracket
`,tags:`(function_definition
  (function_command
    arguments: (argument_list
      .
      (unquoted_argument) @name))) @definition.function

(macro_definition
  (macro_command
    arguments: (argument_list
      .
      (unquoted_argument) @name))) @definition.macro

(command
  name: (identifier) @name) @reference.call
`,folds:`[
  (if_statement)
  (elseif_clause)
  (else_clause)
  (foreach_loop)
  (while_loop)
  (function_definition)
  (macro_definition)
  (block_statement)
  (argument_list)
  (bracket_argument)
  (bracket_comment)
] @fold
`}},css:{wasm:"tree-sitter-css.wasm",title:"CSS",scope:"source.css",fileTypes:["css"],injectionRegex:"^css$",queries:{highlights:`; Highlights for CSS.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(comment) @comment

; Selectors
; ---------

(tag_name) @tag

(class_name) @type

(id_name) @constant

(attribute_name) @attribute

(namespace_name) @module

[
  (universal_selector)
  (nesting_selector)
] @character.special

(pseudo_class_selector
  name: (class_name) @type)

(pseudo_element_selector
  name: (tag_name) @type)

(an_plus_b) @number

; Declarations
; ------------

(property_name) @property

(plain_value) @constant

; Custom property references: \`var(--gap)\`.
((plain_value) @property
  (#match? @property "^--"))

(color_value) @constant

(number_value) @number

(unicode_range) @number

(string_value) @string

(escape_sequence) @string.escape

(function_name) @function

(important) @keyword.modifier

; At-rules
; --------

[
  "@media"
  "@supports"
  "@container"
  "@layer"
  "@scope"
  "@page"
  "@keyframes"
  "@-webkit-keyframes"
  "@-moz-keyframes"
  "@-o-keyframes"
  "@charset"
  "@namespace"
  (at_keyword)
] @keyword

"@import" @keyword.import

[
  "and"
  "or"
  "not"
  "only"
  "of"
] @keyword.operator

[
  "from"
  "to"
  "selector"
] @keyword

(keyword_query) @constant

((keyword_query) @variable
  (#match? @variable "^--"))

(feature_name) @property

[
  (keyframes_name)
  (container_name)
] @label

(layer_name) @module

; Operators and punctuation
; -------------------------

[
  ">"
  "+"
  "~"
  "||"
  "-"
  "*"
  "/"
  "="
  "~="
  "|="
  "^="
  "$="
  "*="
  "<"
  "<="
  ">="
] @operator

[
  "{"
  "}"
  "("
  ")"
  "["
  "]"
] @punctuation.bracket

[
  ","
  ";"
  ":"
  "::"
  "."
  "#"
  "|"
] @punctuation.delimiter
`,folds:`[
  (block)
  (keyframe_block_list)
  (block_value)
  (comment)
] @fold
`}},diff:{wasm:"tree-sitter-diff.wasm",title:"Diff",scope:"source.diff",fileTypes:["diff","patch","debdiff","rej"],injectionRegex:"^(diff|patch|udiff)$",queries:{highlights:`; Highlights for diffs and patches.
;
; Changed lines use the @diff.plus, @diff.minus and @diff.delta captures (as
; in nvim-treesitter); a theme colors the whole line. When several patterns
; match a node, the last one wins.

; Lines
; -----

(addition) @diff.plus

(deletion) @diff.minus

(change) @diff.delta

(no_newline) @comment

; Files
; -----

(command
  "diff" @keyword)

(command
  (option) @variable.parameter)

(command
  (argument) @string.special.path)

(svn_index
  "Index:" @keyword)

(old_file
  [
    "---"
    "***"
  ] @diff.minus)

(new_file
  [
    "+++"
    "---"
  ] @diff.plus)

(old_file
  (path) @string.special.path)

(new_file
  (path) @string.special.path)

(timestamp) @comment

; Extended headers
; ----------------

[
  "index"
  "old mode"
  "new mode"
  "new file mode"
  "deleted file mode"
  "mode"
  "similarity index"
  "dissimilarity index"
  "rename from"
  "rename to"
  "rename old"
  "rename new"
  "copy from"
  "copy to"
  "GIT binary patch"
  "literal"
  "delta"
] @keyword

(index
  (hash) @constant)

(mode) @number

(percentage) @number

(rename
  (path) @string.special.path)

(copy
  (path) @string.special.path)

(binary_files) @keyword

(binary_hunk
  (size) @number)

(binary_data) @string

; Hunk headers
; ------------

(hunk_header
  "@@" @punctuation.special)

(combined_hunk_header
  "@@@" @punctuation.special)

[
  "***************"
  "****"
  "----"
] @punctuation.special

(old_lines
  "***" @punctuation.special)

(new_lines
  "---" @punctuation.special)

(range) @number

(heading) @function

(change_command) @label

(normal_hunk
  "---" @punctuation.special)

; Around the diffs
; ----------------

(separator) @punctuation.special

(signature
  "-- " @punctuation.special)

(signature
  (text) @comment)

(diffstat_file
  (path) @string.special.path)

(diffstat_file
  (number) @number)

(diffstat_file
  (added) @diff.plus)

(diffstat_file
  (removed) @diff.minus)

(diffstat_file
  (binary) @comment)

(diffstat_summary) @comment
`,folds:`[
  (file_diff)
  (hunk)
  (combined_hunk)
  (context_hunk)
  (normal_hunk)
  (binary_patch)
  (diffstat)
] @fold
`}},dockerfile:{wasm:"tree-sitter-dockerfile.wasm",title:"Dockerfile",scope:"source.dockerfile",fileTypes:["Dockerfile","dockerfile","Containerfile","containerfile"],injectionRegex:"^(dockerfile|containerfile)$",queries:{highlights:`; Highlights for Dockerfiles.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Shell-form commands are left
; to the shell grammar in injections.scm.

[
  "FROM"
  "AS"
  "RUN"
  "CMD"
  "LABEL"
  "MAINTAINER"
  "EXPOSE"
  "ENV"
  "ADD"
  "COPY"
  "ENTRYPOINT"
  "VOLUME"
  "USER"
  "WORKDIR"
  "ARG"
  "ONBUILD"
  "STOPSIGNAL"
  "HEALTHCHECK"
  "SHELL"
] @keyword

"NONE" @constant.builtin

(comment) @comment

; Images
; ------

(image_name) @type

(image_tag) @constant

(image_digest) @string.special

(image_alias) @label

; Options and names
; -----------------

(param
  "--" @property
  name: (param_name) @property)

(variable) @variable

(label_key) @property

(port) @number

(signal) @constant

; Strings
; -------

[
  (double_quoted_string)
  (single_quoted_string)
  (json_string)
] @string

[
  (escape_sequence)
  (json_escape_sequence)
  (line_continuation)
] @string.escape

; Heredocs
; --------

(heredoc_line) @string

[
  (heredoc_marker)
  (heredoc_end)
] @label

; Expansions
; ----------

(expansion
  [
    "$"
    "\${"
    "}"
  ] @punctuation.special)

(expansion
  (variable) @variable)

(expansion_operator) @operator

; Punctuation
; -----------

"=" @operator

[
  "["
  "]"
] @punctuation.bracket

"," @punctuation.delimiter
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

; Shell form. The fragments of one command are injected together, so a shell
; grammar sees the command without the line continuations and comment lines
; BuildKit drops.
((shell_command
  (shell_fragment) @injection.content)
  (#set! injection.language "bash")
  (#set! injection.combined))

; RUN <<EOF bodies are scripts for the shell. COPY and ADD bodies are file
; contents of unknown type.
((run_instruction
  (heredoc_body) @injection.content)
  (#set! injection.language "bash"))
`,tags:`; Build stages and the variables a Dockerfile defines.

(from_instruction
  as: (image_alias) @name) @definition.module

(arg_pair
  name: (variable) @name) @definition.constant

(env_pair
  name: (variable) @name) @definition.constant

; FROM <stage> and COPY --from=<stage> may name an earlier stage.
(from_instruction
  (image_spec
    name: (image_name) @name)) @reference.module

(param
  name: (param_name) @_name
  value: (value) @name
  (#eq? @_name "from")) @reference.module
`,folds:`[
  (run_instruction)
  (cmd_instruction)
  (entrypoint_instruction)
  (copy_instruction)
  (add_instruction)
  (env_instruction)
  (label_instruction)
  (healthcheck_instruction)
  (json_string_array)
  (heredoc_body)
] @fold
`}},gitattributes:{wasm:"tree-sitter-gitattributes.wasm",title:"gitattributes",scope:"source.gitattributes",fileTypes:[".gitattributes","gitattributes"],injectionRegex:"^gitattributes$",queries:{highlights:`; Highlights for gitattributes files.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(comment) @comment

; Patterns
; --------

[
  (pattern)
  (quoted_pattern)
] @string.special.path

[
  (wildcard)
  (bracket_expression)
] @character.special

(escape_sequence) @string.escape

(pattern
  "!" @operator)

; Attributes
; ----------

(attribute_name) @property

; Attributes git itself reads (gitattributes(5)), and the built-in \`binary\`
; macro.
((attribute_name) @property.builtin
  (#any-of? @property.builtin
    "text" "eol" "crlf" "working-tree-encoding" "ident" "filter" "diff"
    "merge" "conflict-marker-size" "whitespace" "export-ignore"
    "export-subst" "delta" "encoding" "binary"))

(attribute_value) @string

(attribute
  state: _ @operator)

"=" @operator

; Macros
; ------

"[attr]" @keyword

(macro_definition
  name: (attribute_name) @function.macro)
`,tags:`; Macro definitions (\`[attr]name ...\`) define a name that later lines use as
; an attribute.

(macro_definition
  name: (attribute_name) @name) @definition.macro
`}},go:{wasm:"tree-sitter-go.wasm",title:"Go",scope:"source.go",fileTypes:["go"],injectionRegex:"^(go|golang)$",queries:{highlights:`; Highlights for Go.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

(type_identifier) @type

(field_identifier) @property

(package_identifier) @module

(label_name) @label

; Comments
; --------

(comment) @comment

; Literals
; --------

(interpreted_string_literal) @string
(raw_string_literal) @string
(escape_sequence) @string.escape
(rune_literal) @character
(int_literal) @number
(imaginary_literal) @number
(float_literal) @number.float

(import_spec
  path: (_) @string.special)

(field_declaration
  tag: (_) @string.special)

; Predeclared identifiers. They can be shadowed, so they are identifiers in
; the tree and recognized here by name.
; --------------------------------------------------------------------------

((identifier) @boolean
  (#any-of? @boolean "true" "false"))

((identifier) @constant.builtin
  (#any-of? @constant.builtin "nil" "iota"))

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "any" "bool" "byte" "comparable" "complex64" "complex128" "error"
    "float32" "float64" "int" "int8" "int16" "int32" "int64" "rune"
    "string" "uint" "uint8" "uint16" "uint32" "uint64" "uintptr"))

; Conversions such as \`string(b)\` and arguments such as \`make([]int, n)\`
; put a type name in expression position.
((identifier) @type.builtin
  (#any-of? @type.builtin
    "any" "bool" "byte" "comparable" "complex64" "complex128" "error"
    "float32" "float64" "int" "int8" "int16" "int32" "int64" "rune"
    "string" "uint" "uint8" "uint16" "uint32" "uint64" "uintptr"))

; Declarations
; ------------

(package_clause
  name: (package_identifier) @module)

(import_spec
  name: (package_identifier) @module)

(function_declaration
  name: (identifier) @function)

(method_declaration
  name: (field_identifier) @function.method)

(method_elem
  name: (field_identifier) @function.method)

(parameter_declaration
  name: (identifier) @variable.parameter)

(variadic_parameter_declaration
  name: (identifier) @variable.parameter)

(type_parameter_declaration
  name: (identifier) @type)

(const_spec
  name: (identifier) @constant)

; Calls
; -----

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (selector_expression
    field: (field_identifier) @function.method.call))

(call_expression
  function: (index_expression
    operand: (identifier) @function.call))

(call_expression
  function: (index_expression
    operand: (selector_expression
      field: (field_identifier) @function.method.call)))

((call_expression
  function: (identifier) @function.builtin)
  (#any-of? @function.builtin
    "append" "cap" "clear" "close" "complex" "copy" "delete" "imag" "len"
    "make" "max" "min" "new" "panic" "print" "println" "real" "recover"))

; Composite literal keys are usually struct fields.
(keyed_element
  key: (identifier) @property)

; Keywords
; --------

[
  "const"
  "var"
  "import"
  "package"
  "default"
  "range"
  "goto"
] @keyword

(fallthrough_statement) @keyword

[
  "type"
  "struct"
  "interface"
  "map"
  "chan"
] @keyword.type

"func" @keyword.function

"return" @keyword.return

[
  "go"
  "select"
] @keyword.coroutine

"defer" @keyword.exception

[
  "if"
  "else"
  "switch"
  "case"
] @keyword.conditional

[
  "for"
  "break"
  "continue"
] @keyword.repeat

; \`.(type)\` in a type switch
(type_switch_statement
  "type" @keyword)

; Operators
; ---------

[
  "+" "-" "*" "/" "%"
  "&" "|" "^" "<<" ">>" "&^"
  "+=" "-=" "*=" "/=" "%="
  "&=" "|=" "^=" "<<=" ">>=" "&^="
  "&&" "||" "!"
  "<-" "++" "--"
  "==" "!=" "<" "<=" ">" ">="
  "=" ":="
  "~"
  "..."
] @operator

; Punctuation
; -----------

[
  "(" ")"
  "[" "]"
  "{" "}"
] @punctuation.bracket

[
  "," ";" "." ":"
] @punctuation.delimiter
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

; regexp.MustCompile(\`...\`), regexp.Compile("...") and friends
(call_expression
  function: (selector_expression
    operand: (identifier) @_package
    field: (field_identifier) @_function)
  arguments: (argument_list
    .
    [
      (raw_string_literal
        (string_content) @injection.content)
      (interpreted_string_literal
        (string_content) @injection.content)
    ])
  (#eq? @_package "regexp")
  (#any-of? @_function "Compile" "CompilePOSIX" "MatchString" "MustCompile" "MustCompilePOSIX")
  (#set! injection.language "regex"))
`,locals:`; Scopes
; ------

[
  (source_file)
  (function_declaration)
  (method_declaration)
  (func_literal)
  (block)
  (if_statement)
  (for_statement)
  (expression_switch_statement)
  (type_switch_statement)
  (expression_case)
  (type_case)
  (default_case)
  (communication_case)
] @local.scope

; Definitions
; -----------

(parameter_declaration
  name: (identifier) @local.definition.parameter)

(variadic_parameter_declaration
  name: (identifier) @local.definition.parameter)

(type_parameter_declaration
  name: (identifier) @local.definition.type)

(function_declaration
  name: (identifier) @local.definition.function)

(type_spec
  name: (type_identifier) @local.definition.type)

(type_alias
  name: (type_identifier) @local.definition.type)

(const_spec
  name: (identifier) @local.definition.constant)

(var_spec
  name: (identifier) @local.definition.var)

(short_var_declaration
  left: (expression_list
    (identifier) @local.definition.var))

(range_clause
  left: (expression_list
    (identifier) @local.definition.var))

(receive_statement
  left: (expression_list
    (identifier) @local.definition.var))

(type_switch_statement
  alias: (expression_list
    (identifier) @local.definition.var))

(import_spec
  name: (package_identifier) @local.definition.namespace)

(labeled_statement
  label: (label_name) @local.definition.label)

; References
; ----------

(identifier) @local.reference

(type_identifier) @local.reference
`,tags:`(function_declaration
  name: (identifier) @name) @definition.function

(method_declaration
  name: (field_identifier) @name) @definition.method

(method_elem
  name: (field_identifier) @name) @definition.interface

(type_spec
  name: (type_identifier) @name
  type: (struct_type)) @definition.class

(type_spec
  name: (type_identifier) @name
  type: (interface_type)) @definition.interface

(type_spec
  name: (type_identifier) @name) @definition.type

(type_alias
  name: (type_identifier) @name) @definition.type

(field_declaration
  name: (field_identifier) @name) @definition.field

(package_clause
  name: (package_identifier) @name) @definition.module

(const_spec
  name: (identifier) @name) @definition.constant

(call_expression
  function: [
    (identifier) @name
    (selector_expression
      field: (field_identifier) @name)
    (index_expression
      operand: [
        (identifier) @name
        (selector_expression
          field: (field_identifier) @name)
      ])
  ]) @reference.call

(type_identifier) @name @reference.type
`,folds:`[
  (block)
  (import_spec_list)
  (var_spec_list)
  (const_declaration)
  (type_declaration)
  (field_declaration_list)
  (interface_type)
  (literal_value)
  (expression_switch_statement)
  (type_switch_statement)
  (select_statement)
  (expression_case)
  (type_case)
  (default_case)
  (communication_case)
  (parameter_list)
  (argument_list)
  (raw_string_literal)
] @fold
`}},html:{wasm:"tree-sitter-html.wasm",title:"HTML",scope:"text.html.basic",fileTypes:["html","htm","shtml"],injectionRegex:"^html?$",queries:{highlights:`; Highlights for HTML.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(comment) @comment

(doctype) @keyword.directive

"doctype" @keyword

; Elements

[
  (tag_name)
  (erroneous_end_tag_name)
] @tag

(attribute_name) @tag.attribute

[
  (attribute_value)
  (quoted_attribute_value)
] @string

(entity) @string.escape

; Punctuation

[
  "<"
  ">"
  "</"
  "/>"
  "<!"
] @punctuation.bracket

"=" @punctuation.delimiter
`,injections:`; Injections for HTML: CSS in <style> and style="", TypeScript in <script>
; and on* event handler attributes, JSON in JSON-typed <script>s.
;
; Type values are matched in lowercase, as they are written in practice.

; <style>
(style_element
  (raw_text) @injection.content
  (#set! injection.language "css"))

; <script> with no type attribute. Attributes always follow whitespace, so
; \`data-type=\` does not count as a type.
(script_element
  (start_tag) @_start
  (raw_text) @injection.content
  (#not-match? @_start "\\\\s[tT][yY][pP][eE]\\\\s*=")
  (#set! injection.language "typescript"))

; <script type="module">, <script type="text/javascript">, ...
(script_element
  (start_tag
    (attribute
      name: (attribute_name) @_name
      value: [
        (attribute_value) @_type
        (quoted_attribute_value
          (attribute_value) @_type)
      ]))
  (raw_text) @injection.content
  (#match? @_name "^[tT][yY][pP][eE]$")
  (#match? @_type "^(module|(text|application)/((x-)?(java|ecma)script|typescript|babel|jsx)(;.*)?)$")
  (#set! injection.language "typescript"))

; <script type="application/json">, "application/ld+json", "importmap",
; "speculationrules"
(script_element
  (start_tag
    (attribute
      name: (attribute_name) @_name
      value: [
        (attribute_value) @_type
        (quoted_attribute_value
          (attribute_value) @_type)
      ]))
  (raw_text) @injection.content
  (#match? @_name "^[tT][yY][pP][eE]$")
  (#match? @_type "^(importmap|speculationrules|application/([a-z.+-]+\\\\+)?json)$")
  (#set! injection.language "json"))

; style="color: red". The CSS grammar accepts declarations at the top level.
(attribute
  name: (attribute_name) @_name
  value: [
    (attribute_value) @injection.content
    (quoted_attribute_value
      (attribute_value) @injection.content)
  ]
  (#match? @_name "^[sS][tT][yY][lL][eE]$")
  (#set! injection.language "css"))

; onclick="go()" and other event handlers.
(attribute
  name: (attribute_name) @_name
  value: [
    (attribute_value) @injection.content
    (quoted_attribute_value
      (attribute_value) @injection.content)
  ]
  (#match? @_name "^[oO][nN][a-zA-Z]+$")
  (#set! injection.language "typescript"))
`,folds:`[
  (element)
  (script_element)
  (style_element)
  (comment)
] @fold
`}},java:{wasm:"tree-sitter-java.wasm",title:"Java",scope:"source.java",fileTypes:["java"],injectionRegex:"^java$",queries:{highlights:`; Highlights for Java.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

(this) @variable.builtin

(super) @variable.builtin

; Names by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z]"))

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

; Types
; -----

(type_identifier) @type

(primitive_type) @type.builtin

(void_type) @type.builtin

((type_identifier) @type.builtin
  (#eq? @type.builtin "var"))

(class_declaration
  name: (identifier) @type)

(record_declaration
  name: (identifier) @type)

(enum_declaration
  name: (identifier) @type)

(interface_declaration
  name: (identifier) @type)

(annotation_type_declaration
  name: (identifier) @type)

; Methods and constructors
; ------------------------

(method_declaration
  name: (identifier) @function.method)

(annotation_type_element_declaration
  name: (identifier) @function.method)

(method_invocation
  name: (identifier) @function.method.call)

(method_reference
  name: (identifier) @function.method)

(constructor_declaration
  name: (identifier) @constructor)

(compact_constructor_declaration
  name: (identifier) @constructor)

(explicit_constructor_invocation
  constructor: (_) @constructor)

(object_creation_expression
  type: (type_identifier) @constructor)

(object_creation_expression
  type: (generic_type
    type: (type_identifier) @constructor))

(object_creation_expression
  type: (scoped_type_identifier
    name: (type_identifier) @constructor))

; Variables, fields and parameters
; --------------------------------

(field_declaration
  declarator: (variable_declarator
    name: (identifier) @property))

(field_access
  field: (identifier) @property)

(formal_parameter
  name: (identifier) @variable.parameter)

(spread_parameter
  name: (identifier) @variable.parameter)

(catch_formal_parameter
  name: (identifier) @variable.parameter)

(lambda_expression
  parameters: (identifier) @variable.parameter)

(inferred_parameters
  (identifier) @variable.parameter)

(element_value_pair
  key: (identifier) @variable.member)

(enum_constant
  name: (identifier) @constant)

((field_access
  field: (identifier) @constant)
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((variable_declarator
  name: (identifier) @constant)
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

; Annotations, packages and labels
; --------------------------------

; Dotted names outside expressions (packages, imports, modules, annotation
; names) are scoped_identifiers. Their parts are packages or modules, except
; for a capitalized last part, which names a type.

(package_declaration
  name: (identifier) @module)

(import_declaration
  [
    name: (identifier)
    module: (identifier)
  ] @module)

(module_declaration
  name: (identifier) @module)

(_
  [
    module: (identifier)
    package: (identifier)
  ] @module)

(scoped_identifier
  [
    scope: (identifier)
    name: (identifier)
  ] @module)

((scoped_identifier
  name: (identifier) @type)
  (#match? @type "^[A-Z]"))

((scoped_identifier
  name: (identifier) @constant)
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

(annotation
  "@" @attribute
  name: (identifier) @attribute)

(annotation
  "@" @attribute
  name: (scoped_identifier
    name: (identifier) @attribute))

(annotation_type_declaration
  "@" @keyword.type)

(asterisk) @character.special

(labeled_statement
  label: (identifier) @label)

(break_statement
  label: (identifier) @label)

(continue_statement
  label: (identifier) @label)

; Literals
; --------

(string_literal) @string

(text_block) @string

(escape_sequence) @string.escape

(character_literal) @character

(integer_literal) @number

(floating_point_literal) @number.float

[
  (true)
  (false)
] @boolean

(null_literal) @constant.builtin

(underscore_pattern) @variable.builtin

; Comments
; --------

[
  (line_comment)
  (block_comment)
] @comment

((block_comment) @comment.documentation
  (#match? @comment.documentation "^/[*][*][^*/]"))

((line_comment) @comment.documentation
  (#match? @comment.documentation "^///"))

; Keywords
; --------

[
  "assert"
  "default"
  "extends"
  "implements"
  "permits"
  "package"
  "to"
  "with"
  "when"
] @keyword

[
  "class"
  "record"
  "enum"
  "interface"
] @keyword.type

[
  "abstract"
  "final"
  "native"
  "non-sealed"
  "private"
  "protected"
  "public"
  "sealed"
  "static"
  "strictfp"
  "synchronized"
  "transient"
  "volatile"
  "open"
  "value"
] @keyword.modifier

(requires_modifier) @keyword.modifier

[
  "import"
  "module"
  "requires"
  "exports"
  "opens"
  "uses"
  "provides"
] @keyword.import

"new" @keyword.operator

"instanceof" @keyword.operator

[
  "return"
  "yield"
] @keyword.return

[
  "if"
  "else"
  "switch"
  "case"
] @keyword.conditional

[
  "for"
  "while"
  "do"
  "break"
  "continue"
] @keyword.repeat

[
  "try"
  "catch"
  "finally"
  "throw"
  "throws"
] @keyword.exception

(wildcard
  [
    "extends"
    "super"
  ] @keyword)

(class_literal
  "class" @keyword)

; Operators
; ---------

[
  "+" "-" "*" "/" "%" "++" "--" "!" "~" "&" "|" "^" "<<" ">>" ">>>"
  "&&" "||" "==" "!=" "<" "<=" ">" ">=" "=" "+=" "-=" "*=" "/=" "%="
  "&=" "|=" "^=" "<<=" ">>=" ">>>=" "->" "::" "?"
] @operator

(wildcard
  "?" @character.special)

; Punctuation
; -----------

[
  "(" ")" "[" "]" "{" "}"
] @punctuation.bracket

(type_arguments
  [
    "<"
    ">"
  ] @punctuation.bracket)

(type_parameters
  [
    "<"
    ">"
  ] @punctuation.bracket)

[
  ";" "," "." ":" "..."
] @punctuation.delimiter

(ternary_expression
  ":" @operator)
`,injections:`([
  (line_comment)
  (block_comment)
] @injection.content
  (#set! injection.language "comment"))

; Javadoc
((block_comment) @injection.content
  (#match? @injection.content "^/[*][*][^*/]")
  (#set! injection.language "javadoc"))
`,locals:`; Scopes
; ------

[
  (program)
  (class_body)
  (interface_body)
  (enum_body)
  (annotation_type_body)
  (block)
  (method_declaration)
  (constructor_declaration)
  (compact_constructor_declaration)
  (record_declaration)
  (lambda_expression)
  (for_statement)
  (enhanced_for_statement)
  (catch_clause)
  (try_with_resources_statement)
  (switch_rule)
  (switch_block_statement_group)
] @local.scope

; Definitions
; -----------

(local_variable_declaration
  declarator: (variable_declarator
    name: (identifier) @local.definition.var))

(field_declaration
  declarator: (variable_declarator
    name: (identifier) @local.definition.field))

(formal_parameter
  name: (identifier) @local.definition.parameter)

(spread_parameter
  name: (identifier) @local.definition.parameter)

(catch_formal_parameter
  name: (identifier) @local.definition.parameter)

(lambda_expression
  parameters: (identifier) @local.definition.parameter)

(inferred_parameters
  (identifier) @local.definition.parameter)

(enhanced_for_statement
  name: (identifier) @local.definition.var)

(resource
  name: (identifier) @local.definition.var)

(type_pattern
  name: (identifier) @local.definition.var)

(instanceof_expression
  name: (identifier) @local.definition.var)

(method_declaration
  name: (identifier) @local.definition.method)

(type_parameter
  name: (type_identifier) @local.definition.type)

; References
; ----------

(identifier) @local.reference
`,tags:`(class_declaration
  name: (identifier) @name) @definition.class

(record_declaration
  name: (identifier) @name) @definition.class

(enum_declaration
  name: (identifier) @name) @definition.enum

(interface_declaration
  name: (identifier) @name) @definition.interface

(annotation_type_declaration
  name: (identifier) @name) @definition.interface

(method_declaration
  name: (identifier) @name) @definition.method

(constructor_declaration
  name: (identifier) @name) @definition.constructor

(compact_constructor_declaration
  name: (identifier) @name) @definition.constructor

(module_declaration
  name: (_) @name) @definition.module

(method_invocation
  name: (identifier) @name
  arguments: (argument_list) @reference.call)

(object_creation_expression
  type: [
    (type_identifier) @name
    (generic_type
      type: (type_identifier) @name)
    (scoped_type_identifier
      name: (type_identifier) @name)
  ]) @reference.class

(superclass
  [
    (type_identifier) @name
    (generic_type
      type: (type_identifier) @name)
  ]) @reference.class

(super_interfaces
  (type_list
    [
      (type_identifier) @name
      (generic_type
        type: (type_identifier) @name)
    ])) @reference.implementation

(extends_interfaces
  (type_list
    [
      (type_identifier) @name
      (generic_type
        type: (type_identifier) @name)
    ])) @reference.interface
`,folds:`[
  (class_body)
  (interface_body)
  (enum_body)
  (annotation_type_body)
  (module_body)
  (block)
  (switch_block)
  (array_initializer)
  (element_value_array_initializer)
  (argument_list)
  (formal_parameters)
  (text_block)
  (block_comment)
] @fold
`}},json:{wasm:"tree-sitter-json.wasm",title:"JSON",scope:"source.json",fileTypes:["json","jsonc","jsonl"],injectionRegex:"^jsonc?$",queries:{highlights:`; Highlights for JSON.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(string) @string

(pair
  key: (string) @property)

(escape_sequence) @string.escape

(number) @number

[
  (true)
  (false)
] @boolean

(null) @constant.builtin

(comment) @comment

[
  "{"
  "}"
  "["
  "]"
] @punctuation.bracket

[
  ":"
  ","
] @punctuation.delimiter
`,folds:`[
  (object)
  (array)
] @fold
`}},just:{wasm:"tree-sitter-just.wasm",title:"Justfile",scope:"source.just",fileTypes:["just","justfile","Justfile",".justfile",".Justfile","JUSTFILE"],injectionRegex:"^(just|justfile)$",queries:{highlights:`; Highlights for justfiles.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Recipe bodies are left to the
; shell (or the shebang's interpreter) in injections.scm.

(comment) @comment

; Keywords
; --------

[
  "alias"
  "export"
  "unexport"
  "eager"
  "set"
] @keyword

[
  "import"
  "mod"
] @keyword.import

[
  "if"
  "else"
] @keyword.conditional

"assert" @keyword

(import
  optional: "?" @keyword.modifier)

(module
  optional: "?" @keyword.modifier)

(boolean) @boolean

; Names
; -----

(identifier) @variable

(assignment
  name: (identifier) @variable)

(export
  name: (identifier) @variable)

(unexport
  name: (identifier) @variable)

(setting
  name: (identifier) @property)

(module
  name: (identifier) @module)

(module_path
  (identifier) @module
  .
  "::")

; just's constants: HEX, PATH_SEP, and the terminal styles (BOLD, RED, ...).
((identifier) @constant.builtin
  (#any-of? @constant.builtin
    "HEX" "HEXLOWER" "HEXUPPER" "PATH_SEP" "PATH_VAR_SEP" "CLEAR" "NORMAL"
    "BOLD" "ITALIC" "UNDERLINE" "INVERT" "HIDE" "STRIKETHROUGH" "BLACK" "RED"
    "GREEN" "YELLOW" "BLUE" "MAGENTA" "CYAN" "WHITE" "BG_BLACK" "BG_RED"
    "BG_GREEN" "BG_YELLOW" "BG_BLUE" "BG_MAGENTA" "BG_CYAN" "BG_WHITE"))

; Recipes
; -------

(recipe_header
  name: (identifier) @function)

(recipe_header
  quiet: "@" @punctuation.special)

(parameter
  name: (identifier) @variable.parameter)

(parameter
  export: "$" @punctuation.special)

(variadic_parameter
  kind: _ @operator)

(dependency
  recipe: (identifier) @function.call)

(dependency
  recipe: (module_path
    (identifier) @function.call .))

(dependency
  mapped: "*" @operator)

(starred_argument
  "*" @operator)

(alias
  name: (identifier) @function)

(alias
  target: (identifier) @function.call)

(alias
  target: (module_path
    (identifier) @function.call .))

(shebang) @comment

(prefix) @punctuation.special

; Functions
; ---------

(function_definition
  name: (identifier) @function)

(function_parameters
  (identifier) @variable.parameter)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (identifier) @function.builtin
  (#any-of? @function.builtin
    "absolute_path" "append" "arch" "blake3" "blake3_file" "bool"
    "cache_directory" "canonicalize" "capitalize" "choose" "clean"
    "config_directory" "config_local_directory" "data_directory"
    "data_local_directory" "datetime" "datetime_utc" "encode_uri_component"
    "env" "env_var" "env_var_or_default" "error" "executable_directory"
    "extension" "file_name" "file_stem" "home_directory"
    "invocation_directory" "invocation_directory_native" "is_dependency"
    "join" "join_list" "just_executable" "just_pid" "just_version" "justfile"
    "justfile_directory" "kebabcase" "len" "lowercamelcase" "lowercase"
    "module_directory" "module_file" "module_path" "num_cpus" "num_jobs" "os"
    "os_family" "parent_directory" "path_exists" "prepend" "quote" "read"
    "recipe_name" "replace" "replace_regex" "require" "runtime_directory"
    "semver_matches" "sha256" "sha256_file" "shell" "shoutykebabcase"
    "shoutysnakecase" "show" "snakecase" "source_directory" "source_file"
    "split" "style" "titlecase" "trim" "trim_end" "trim_end_match"
    "trim_end_matches" "trim_start" "trim_start_match" "trim_start_matches"
    "uppercamelcase" "uppercase" "uuid" "which" "without_extension"))

; Attributes
; ----------

(attribute
  name: (identifier) @attribute)

(keyword_argument
  name: (identifier) @property)

; Strings
; -------

[
  (string)
  (format_string)
] @string

(escape_sequence) @string.escape

(backtick) @string.special

(import
  path: (string) @string.special.path)

(module
  path: (string) @string.special.path)

; Operators and punctuation
; -------------------------

[
  ":="
  "="
  "=="
  "!="
  "=~"
  "!~"
  "+"
  "++"
  "/"
  "!"
  "&&"
  "||"
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  ":"
  "::"
] @punctuation.delimiter

(interpolation
  [
    "{{"
    "}}"
  ] @punctuation.special)
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

; Backticks run in the shell.
((backtick
  (command) @injection.content)
  (#set! injection.language "bash"))

; Each line of a recipe without a shebang is run by the shell on its own, so
; each is injected on its own. Interpolations and the \`@\`/\`-\` prefix are left
; out. A \`set shell\` or \`[script]\` recipe is still read as shell.
((recipe_line) @injection.content
  (#set! injection.language "bash"))

; A shebang recipe's body is one script. Its shebang names the interpreter;
; the body, less the shebang and interpolations, is injected as a whole.
((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ](ba|z|da|k)?sh( |$)")
  (#set! injection.language "bash"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ](python[0-9.]*|uv run.*|pypy[0-9.]*)( |$)")
  (#set! injection.language "python"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ](node|deno|bun|tsx|ts-node)( |$)")
  (#set! injection.language "typescript"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ]ruby( |$)")
  (#set! injection.language "ruby"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ](lua|luajit)[0-9.]*( |$)")
  (#set! injection.language "lua"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ]nix-shell( |$)")
  (#set! injection.language "bash"))
`,tags:`; Recipes, variables, functions and modules a justfile defines, and the
; recipes and functions it refers to.

(recipe
  (recipe_header
    name: (identifier) @name)) @definition.function

(alias
  name: (identifier) @name) @definition.function

(function_definition
  name: (identifier) @name) @definition.function

(assignment
  name: (identifier) @name) @definition.constant

(export
  name: (identifier) @name) @definition.constant

(module
  name: (identifier) @name) @definition.module

(dependency
  recipe: (identifier) @name) @reference.call

(dependency
  recipe: (module_path
    (identifier) @name .)) @reference.call

(alias
  target: (identifier) @name) @reference.call

(call_expression
  function: (identifier) @name) @reference.call
`,folds:`[
  (recipe)
  (if_expression)
  (block)
  (arguments)
  (list)
] @fold
`}},kdl:{wasm:"tree-sitter-kdl.wasm",title:"KDL",scope:"source.kdl",fileTypes:["kdl"],injectionRegex:"^kdl$",queries:{highlights:`; Highlights for KDL.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

; Values
; ------

; A bare identifier in value position is a string.
[
  (identifier)
  (string)
  (raw_string)
] @string

(escape_sequence) @string.escape

(number) @number

(boolean) @boolean

(null) @constant.builtin

; Names
; -----

(node
  name: (_) @tag)

(property
  key: (_) @property)

(type
  (_) @type)

; Punctuation
; -----------

[
  "{"
  "}"
  "("
  ")"
] @punctuation.bracket

"=" @operator

";" @punctuation.delimiter

"\\\\" @punctuation.special

; Comments
; --------

[
  (line_comment)
  (block_comment)
] @comment

; \`/-\` comments out what follows it. The innermost capture wins, so the
; element's own names and values are captured as well, down to the entries
; of a commented-out node. Deeper than that (escapes, nodes inside a
; commented-out children block) keep their colors.

(slashdash) @comment

[
  (node
    (slashdash))
  (argument
    (slashdash))
  (property
    (slashdash))
  (children
    (slashdash))
] @comment

(node
  (slashdash)
  [
    name: (_) @comment
    type: (type
      (_) @comment)
    (argument
      type: (type
        (_) @comment)?
      value: (_) @comment)
    (property
      key: (_) @comment
      type: (type
        (_) @comment)?
      value: (_) @comment)
  ])

(argument
  (slashdash)
  type: (type
    (_) @comment)?
  value: (_) @comment)

(property
  (slashdash)
  key: (_) @comment
  type: (type
    (_) @comment)?
  value: (_) @comment)

(children
  (slashdash)
  [
    "{" @comment
    "}" @comment
    (node
      name: (_) @comment)
  ])
`,folds:`[
  (children)
  (block_comment)
  (string)
  (raw_string)
] @fold
`}},lua:{wasm:"tree-sitter-lua.wasm",title:"Lua",scope:"source.lua",fileTypes:["lua"],injectionRegex:"^lua$",queries:{highlights:`; Highlights for Lua.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Names by convention
; -------------------

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((identifier) @variable.builtin
  (#any-of? @variable.builtin "_G" "_ENV" "_VERSION" "self"))

((identifier) @module.builtin
  (#any-of? @module.builtin
    "coroutine" "debug" "io" "math" "os" "package" "string" "table" "utf8"))

; Fields, parameters and declarations
; -----------------------------------

(dot_index_expression
  field: (identifier) @property)

(field
  name: (identifier) @property)

(parameters
  name: (identifier) @variable.parameter)

(vararg_parameter
  name: (identifier) @variable.parameter)

(attribute
  "<" @punctuation.special
  name: (identifier) @attribute
  ">" @punctuation.special)

(label_statement
  name: (identifier) @label)

(goto_statement
  label: (identifier) @label)

; Functions
; ---------

(function_declaration
  name: (identifier) @function)

(function_declaration
  name: (dot_index_expression
    field: (identifier) @function))

(function_declaration
  name: (method_index_expression
    method: (identifier) @function.method))

(local_function_declaration
  name: (identifier) @function)

(global_function_declaration
  name: (identifier) @function)

(assignment_statement
  left: (variable_list
    .
    name: [
      (identifier) @function
      (dot_index_expression
        field: (identifier) @function)
    ])
  right: (expression_list
    .
    value: (function_definition)))

(local_variable_declaration
  .
  name: (identifier) @function
  value: (expression_list
    .
    value: (function_definition)))

(field
  name: (identifier) @function
  value: (function_definition))

(function_call
  name: [
    (identifier) @function.call
    (dot_index_expression
      field: (identifier) @function.call)
    (method_index_expression
      method: (identifier) @function.method.call)
  ])

(function_call
  name: (identifier) @function.builtin
  (#any-of? @function.builtin
    "assert" "collectgarbage" "dofile" "error" "getmetatable" "ipairs" "load"
    "loadfile" "next" "pairs" "pcall" "print" "rawequal" "rawget" "rawlen"
    "rawset" "require" "select" "setmetatable" "tonumber" "tostring" "type"
    "warn" "xpcall" "getfenv" "setfenv" "loadstring" "module" "unpack"))

; Metamethods
((identifier) @function.builtin
  (#any-of? @function.builtin
    "__add" "__sub" "__mul" "__div" "__mod" "__pow" "__unm" "__idiv" "__band"
    "__bor" "__bxor" "__shl" "__shr" "__bnot" "__concat" "__len" "__eq" "__lt"
    "__le" "__index" "__newindex" "__call" "__tostring" "__name" "__close"
    "__gc" "__mode" "__metatable" "__pairs"))

; Literals
; --------

(nil) @constant.builtin

[
  (true)
  (false)
] @boolean

(number) @number

(string) @string

(escape_sequence) @string.escape

(vararg_expression) @variable.builtin

(vararg_parameter
  "..." @variable.builtin)

(comment) @comment

((comment) @comment.documentation
  (#match? @comment.documentation "^---[^-]"))

; Keywords
; --------

[
  "local"
  "global"
] @keyword

(wildcard) @character.special

"function" @keyword.function

"return" @keyword.return

[
  "if"
  "then"
  "elseif"
  "else"
] @keyword.conditional

[
  "for"
  "while"
  "repeat"
  "until"
  "in"
] @keyword.repeat

(break_statement) @keyword.repeat

[
  "do"
  "end"
  "goto"
] @keyword

[
  "and"
  "or"
  "not"
] @keyword.operator

; Operators and punctuation
; -------------------------

(binary_expression
  operator: _ @operator)

(unary_expression
  operator: _ @operator)

(binary_expression
  operator: [
    "and"
    "or"
  ] @keyword.operator)

(unary_expression
  operator: "not" @keyword.operator)

"=" @operator

[
  ";"
  ":"
  "::"
  ","
  "."
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

; \`load("...")\` and \`loadstring("...")\` take Lua source.
(function_call
  name: (identifier) @_name
  (#any-of? @_name "load" "loadstring")
  arguments: (arguments
    .
    (string
      content: (string_content) @injection.content))
  (#set! injection.language "lua"))
`,locals:`; Scopes
; ------

[
  (chunk)
  (do_statement)
  (while_statement)
  (repeat_statement)
  (if_statement)
  (elseif_statement)
  (else_statement)
  (for_statement)
  (function_declaration)
  (local_function_declaration)
  (global_function_declaration)
  (function_definition)
] @local.scope

; Definitions
; -----------

(local_variable_declaration
  name: (identifier) @local.definition.var)

(local_function_declaration
  name: (identifier) @local.definition.function)

(for_numeric_clause
  name: (identifier) @local.definition.var)

(for_generic_clause
  (name_list
    name: (identifier) @local.definition.var))

(parameters
  name: (identifier) @local.definition.parameter)

(vararg_parameter
  name: (identifier) @local.definition.parameter)

(label_statement
  name: (identifier) @local.definition.label)

; References
; ----------

(identifier) @local.reference
`,tags:`(function_declaration
  name: [
    (identifier) @name
    (dot_index_expression
      field: (identifier) @name)
  ]) @definition.function

(function_declaration
  name: (method_index_expression
    method: (identifier) @name)) @definition.method

(local_function_declaration
  name: (identifier) @name) @definition.function

(global_function_declaration
  name: (identifier) @name) @definition.function

(assignment_statement
  left: (variable_list
    .
    name: [
      (identifier) @name
      (dot_index_expression
        field: (identifier) @name)
    ])
  right: (expression_list
    .
    value: (function_definition))) @definition.function

(local_variable_declaration
  .
  name: (identifier) @name
  value: (expression_list
    .
    value: (function_definition))) @definition.function

(field
  name: (identifier) @name
  value: (function_definition)) @definition.function

(function_call
  name: [
    (identifier) @name
    (dot_index_expression
      field: (identifier) @name)
    (method_index_expression
      method: (identifier) @name)
  ]) @reference.call
`,folds:`[
  (do_statement)
  (while_statement)
  (repeat_statement)
  (if_statement)
  (elseif_statement)
  (else_statement)
  (for_statement)
  (function_declaration)
  (local_function_declaration)
  (global_function_declaration)
  (function_definition)
  (table_constructor)
  (arguments)
  (string)
  (comment)
] @fold
`}},make:{wasm:"tree-sitter-make.wasm",title:"Makefile (GNU make)",scope:"source.make",fileTypes:["mk","mak","make","gmk","Makefile","makefile","GNUmakefile","Kbuild"],injectionRegex:"^(make|makefile|gmake|mk)$",queries:{highlights:`; Highlights for GNU makefiles.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Recipe lines are left to the
; shell in injections.scm.

(comment) @comment

; Keywords
; --------

[
  "define"
  "endef"
  "undefine"
  "export"
  "unexport"
  "override"
  "private"
  "vpath"
] @keyword

[
  "include"
  "-include"
  "sinclude"
  "load"
  "-load"
] @keyword.import

[
  "ifeq"
  "ifneq"
  "ifdef"
  "ifndef"
  "else"
  "endif"
] @keyword.conditional

; Rules
; -----

(targets
  (word) @function)

; .PHONY, .SUFFIXES, .DEFAULT, .SECONDEXPANSION and the rest.
((targets
  (word) @function.builtin)
  (#match? @function.builtin "^\\\\.[A-Z_]+$"))

(target_pattern
  (word) @string.special.path)

(prerequisites
  (word) @string.special.path)

(prefix) @punctuation.special

; Variables
; ---------

(variable_assignment
  name: (word) @variable)

(define_directive
  name: (word) @variable)

(undefine_directive
  name: (word) @variable)

(export_directive
  variables: (word) @variable)

(unexport_directive
  variables: (word) @variable)

(ifdef_directive
  variable: (word) @variable)

(variable_name) @variable

; Variables make sets itself.
((variable_name) @variable.builtin
  (#any-of? @variable.builtin
    "MAKE" "MAKECMDGOALS" "MAKEFILE_LIST" "MAKEFLAGS" "MAKELEVEL" "MAKEOVERRIDES"
    "MAKE_HOST" "MAKE_RESTARTS" "MAKE_TERMERR" "MAKE_TERMOUT" "MAKE_VERSION"
    "MFLAGS" "CURDIR" "SHELL" ".DEFAULT_GOAL" ".FEATURES" ".INCLUDE_DIRS"
    ".LOADED" ".RECIPEPREFIX" ".SHELLFLAGS" ".SHELLSTATUS" ".VARIABLES"
    "SUFFIXES" "VPATH" "GPATH" "MAKESHELL" "MAKEFILES"))

(automatic_variable) @variable.builtin

; $(@D), $(<F) and the like, written as references.
((variable_reference
  name: (variable_name) @variable.builtin)
  (#match? @variable.builtin "^[@<^+?*%|][DF]?$"))

(function_name) @function.builtin

; The function \`$(call ...)\` calls.
(function_call
  function: (function_name) @_call
  .
  argument: (text) @function.call
  (#eq? @_call "call"))

(escape_sequence) @string.escape

(string) @string

(vpath_directive
  [
    pattern: (word)
    directory: (word)
  ] @string.special.path)

(include_directive
  path: (word) @string.special.path)

(load_directive
  path: (word) @string.special.path)

; Operators and punctuation
; -------------------------

(variable_assignment
  operator: _ @operator)

(define_directive
  operator: _ @operator)

(rule
  operator: _ @punctuation.delimiter)

(target_variable
  [
    ":"
    "::"
  ] @punctuation.delimiter)

[
  ";"
  "|"
] @punctuation.delimiter

(rule
  ":" @punctuation.delimiter)

(variable_reference
  [
    ":"
    "="
  ] @operator)

[
  "("
  ")"
  "{"
  "}"
] @punctuation.bracket

","  @punctuation.delimiter

[
  "$("
  "\${"
  "$$("
  "$\${"
] @punctuation.special

(variable_reference
  [
    ")"
    "}"
  ] @punctuation.special)

(function_call
  [
    ")"
    "}"
  ] @punctuation.special)
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

; Each recipe line is run by the shell on its own. References, \`$$\` and the
; \`@\`/\`-\`/\`+\` prefix are left out of the injected text.
((recipe_line) @injection.content
  (#set! injection.language "bash"))

; $(shell command) and NAME != command
((function_call
  function: (function_name) @_function
  argument: (text) @injection.content)
  (#eq? @_function "shell")
  (#set! injection.language "bash"))

((variable_assignment
  operator: "!="
  value: (text) @injection.content)
  (#set! injection.language "bash"))
`,tags:`; Targets, variables and defines a makefile defines, and the variables and
; \`$(call ...)\`ed defines it refers to.

(rule
  targets: (targets
    (word) @name)) @definition.function

(variable_assignment
  name: (word) @name) @definition.constant

(define_directive
  name: (word) @name) @definition.macro

(variable_reference
  name: (variable_name) @name) @reference.constant

(function_call
  function: (function_name) @_call
  .
  argument: (text) @name
  (#eq? @_call "call")) @reference.call
`,folds:`[
  (rule)
  (conditional)
  (define_directive)
] @fold
`}},nix:{wasm:"tree-sitter-nix.wasm",title:"Nix",scope:"source.nix",fileTypes:["nix"],injectionRegex:"^nix$",queries:{highlights:`; Highlights for Nix.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Comments
; --------

(comment) @comment

; Literals
; --------

; Strings and paths are captured piece by piece, so that the code in an
; interpolation is not inside a string range.
(string_fragment) @string
(string_expression "\\"" @string)
(indented_string_expression "''" @string)
(escape_sequence) @string.escape

(path_fragment) @string.special.path
(spath_expression) @string.special.path
(uri_expression) @string.special.url

(integer_expression) @number
(float_expression) @number.float

; Predefined names. They can be shadowed, so they are identifiers in the tree
; and recognized here by name.
; -------------------------------------------------------------------------

((identifier) @boolean
  (#any-of? @boolean "true" "false"))

((identifier) @constant.builtin
  (#any-of? @constant.builtin "null" "__curPos" "__currentSystem" "__currentTime"
    "__nixPath" "__nixVersion" "__storeDir" "__langVersion"))

((identifier) @module.builtin
  (#eq? @module.builtin "builtins"))

; Functions that are in scope without \`builtins.\`.
((identifier) @function.builtin
  (#any-of? @function.builtin
    "abort" "baseNameOf" "break" "derivation" "derivationStrict" "dirOf"
    "fetchGit" "fetchMercurial" "fetchTarball" "fetchTree" "fromTOML" "import"
    "isNull" "map" "placeholder" "removeAttrs" "scopedImport" "throw"
    "toString"))

; Attributes
; ----------

(attrpath
  attr: (identifier) @property)

(inherited_attrs
  attr: (identifier) @property)

; Functions
; ---------

(formal
  name: (identifier) @variable.parameter)

(function_expression
  universal: (identifier) @variable.parameter)

(apply_expression
  function: (variable_expression
    name: (identifier) @function.call))

(apply_expression
  function: (select_expression
    attrpath: (attrpath
      attr: (identifier) @function.call .)))

(binding
  attrpath: (attrpath
    attr: (identifier) @function .)
  expression: (function_expression))

((apply_expression
  function: (variable_expression
    name: (identifier) @function.builtin))
  (#any-of? @function.builtin
    "abort" "baseNameOf" "break" "derivation" "derivationStrict" "dirOf"
    "fetchGit" "fetchMercurial" "fetchTarball" "fetchTree" "fromTOML" "import"
    "isNull" "map" "placeholder" "removeAttrs" "scopedImport" "throw"
    "toString"))

(apply_expression
  function: (select_expression
    expression: (variable_expression
      name: (identifier) @module.builtin)
    attrpath: (attrpath
      attr: (identifier) @function.builtin .))
  (#eq? @module.builtin "builtins"))

; Keywords
; --------

[
  "let"
  "in"
  "rec"
  "inherit"
  "with"
] @keyword

"assert" @keyword.debug

[
  "if"
  "then"
  "else"
] @keyword.conditional

; Only in \`a.b or c\`; as an attribute name (\`lib.or\`) it is an identifier.
"or" @keyword.operator

; Operators
; ---------

[
  "!" "-" "+" "*" "/"
  "++" "//"
  "==" "!=" "<" "<=" ">" ">="
  "&&" "||" "->"
  "|>" "<|"
  "?"
  "="
  "@"
] @operator

; Punctuation
; -----------

[
  "(" ")"
  "[" "]"
  "{" "}"
] @punctuation.bracket

[
  "."
  ","
  ";"
  ":"
] @punctuation.delimiter

(ellipses) @punctuation.special

(interpolation
  "\${" @punctuation.special
  "}" @punctuation.special)
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

; Build phases and hooks are shell scripts:
;   buildPhase = '' … '';
(binding
  attrpath: (attrpath
    attr: (identifier) @_name .)
  expression: (indented_string_expression
    (string_fragment) @injection.content)
  (#match? @_name "^(unpack|patch|configure|build|check|install|fixup|installCheck|dist|shell)Phase$|^(pre|post)(Unpack|Patch|Configure|Build|Check|Install|Fixup|InstallCheck|Dist)$|^shellHook$|^(script|preStart|postStart|preStop|postStop)$")
  (#set! injection.language "bash")
  (#set! injection.combined))

; writeShellScript "name" '' … '', runCommand "name" { } '' … '' and the like.
(apply_expression
  function: [
    (variable_expression
      name: (identifier) @_function)
    (select_expression
      attrpath: (attrpath
        attr: (identifier) @_function .))
  ]
  argument: (indented_string_expression
    (string_fragment) @injection.content)
  (#match? @_function "^(writeShellScript|writeShellScriptBin|writeShellApplication|runCommand|runCommandLocal|runCommandCC|writeScript|writeScriptBin)$")
  (#set! injection.language "bash")
  (#set! injection.combined))

; A language named in a comment right before a string: /* lua */ '' … ''
((comment) @injection.language
  .
  [
    (indented_string_expression
      (string_fragment) @injection.content)
    (string_expression
      (string_fragment) @injection.content)
  ]
  (#match? @injection.language "^/\\\\*\\\\s*[a-zA-Z0-9_+-]+\\\\s*\\\\*/$")
  (#gsub! @injection.language "/%*%s*([%w%p]+)%s*%*/" "%1")
  (#set! injection.combined))
`,locals:`; Scopes
; ------

[
  (source_code)
  (function_expression)
  (let_expression)
  (let_attrset_expression)
  (rec_attrset_expression)
] @local.scope

; Definitions
; -----------

(function_expression
  universal: (identifier) @local.definition.parameter)

(formal
  name: (identifier) @local.definition.parameter)

; \`let x = …;\`, \`rec { x = …; }\`: the first attribute of a binding names a
; variable in the scope.
(let_expression
  (binding_set
    binding: (binding
      attrpath: (attrpath
        .
        attr: (identifier) @local.definition.var))))

(let_attrset_expression
  (binding_set
    binding: (binding
      attrpath: (attrpath
        .
        attr: (identifier) @local.definition.var))))

(rec_attrset_expression
  (binding_set
    binding: (binding
      attrpath: (attrpath
        .
        attr: (identifier) @local.definition.var))))

; \`inherit x;\` and \`inherit (e) x;\` in a let or rec set.
(let_expression
  (binding_set
    binding: (_
      attrs: (inherited_attrs
        attr: (identifier) @local.definition.var))))

(rec_attrset_expression
  (binding_set
    binding: (_
      attrs: (inherited_attrs
        attr: (identifier) @local.definition.var))))

; References
; ----------

(variable_expression
  name: (identifier) @local.reference)
`,tags:`; A binding whose value is a function defines that function.
(binding
  attrpath: (attrpath
    attr: (identifier) @name .)
  expression: (function_expression)) @definition.function

(apply_expression
  function: [
    (variable_expression
      name: (identifier) @name)
    (select_expression
      attrpath: (attrpath
        attr: (identifier) @name .))
  ]) @reference.call
`,folds:`[
  (attrset_expression)
  (rec_attrset_expression)
  (let_attrset_expression)
  (let_expression)
  (list_expression)
  (formals)
  (parenthesized_expression)
  (indented_string_expression)
  (comment)
] @fold
`}},python:{wasm:"tree-sitter-python.wasm",title:"Python",scope:"source.python",fileTypes:["py","pyi","pyw","SConstruct","SConscript","wscript"],injectionRegex:"^(py|python)$",queries:{highlights:`; Highlights for Python.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Names by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z]"))

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((identifier) @variable.builtin
  (#any-of? @variable.builtin "self" "cls"))

((identifier) @constant.builtin
  (#any-of? @constant.builtin "NotImplemented" "Ellipsis" "__debug__"))

((identifier) @variable.builtin
  (#any-of? @variable.builtin
    "__name__" "__file__" "__doc__" "__package__" "__spec__" "__loader__"
    "__builtins__" "__dict__" "__class__" "__module__" "__qualname__"
    "__all__" "__slots__" "__annotations__"))

((identifier) @type.builtin
  (#any-of? @type.builtin
    "bool" "bytearray" "bytes" "complex" "dict" "float" "frozenset" "int"
    "list" "memoryview" "object" "range" "set" "slice" "str" "tuple" "type"))

((identifier) @type.builtin
  (#match? @type.builtin
    "^(BaseException|Exception|BaseExceptionGroup|ExceptionGroup|ArithmeticError|AssertionError|AttributeError|BlockingIOError|BrokenPipeError|BufferError|ChildProcessError|ConnectionAbortedError|ConnectionError|ConnectionRefusedError|ConnectionResetError|EOFError|EnvironmentError|FileExistsError|FileNotFoundError|FloatingPointError|GeneratorExit|IOError|ImportError|IndentationError|IndexError|InterruptedError|IsADirectoryError|KeyError|KeyboardInterrupt|LookupError|MemoryError|ModuleNotFoundError|NameError|NotADirectoryError|NotImplementedError|OSError|OverflowError|PermissionError|ProcessLookupError|PythonFinalizationError|RecursionError|ReferenceError|RuntimeError|StopAsyncIteration|StopIteration|SyntaxError|SystemError|SystemExit|TabError|TimeoutError|TypeError|UnboundLocalError|UnicodeDecodeError|UnicodeEncodeError|UnicodeError|UnicodeTranslateError|ValueError|ZeroDivisionError|Warning|BytesWarning|DeprecationWarning|EncodingWarning|FutureWarning|ImportWarning|PendingDeprecationWarning|ResourceWarning|RuntimeWarning|SyntaxWarning|UnicodeWarning|UserWarning)$"))

; Attributes and parameters
; -------------------------

(attribute
  attribute: (identifier) @property)

((attribute
  attribute: (identifier) @constant)
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

(keyword_argument
  name: (identifier) @variable.parameter)

(parameters
  (identifier) @variable.parameter)

(lambda_parameters
  (identifier) @variable.parameter)

(default_parameter
  name: (identifier) @variable.parameter)

(typed_parameter
  (identifier) @variable.parameter)

(typed_default_parameter
  name: (identifier) @variable.parameter)

(list_splat_pattern
  (identifier) @variable.parameter)

(dictionary_splat_pattern
  (identifier) @variable.parameter)

(keyword_pattern
  name: (identifier) @variable.parameter)

((parameters
  .
  (identifier) @variable.builtin)
  (#any-of? @variable.builtin "self" "cls"))

; Types
; -----

(type
  (identifier) @type)

(type
  (subscript
    value: (identifier) @type))

(type
  (subscript
    subscript: (identifier) @type))

(type
  (binary_operator
    [
      left: (identifier) @type
      right: (identifier) @type
    ]))

(type
  (attribute
    attribute: (identifier) @type))

(type_parameter
  name: (identifier) @type)

(type_alias_statement
  name: (identifier) @type)

(class_definition
  name: (identifier) @type)

(class_definition
  superclasses: (argument_list
    (identifier) @type))

(class_pattern
  (dotted_name
    (identifier) @type .))

; Functions
; ---------

(function_definition
  name: (identifier) @function)

((class_definition
  body: (block
    [
      (function_definition
        name: (identifier) @function.method)
      (decorated_definition
        definition: (function_definition
          name: (identifier) @function.method))
    ])))

((class_definition
  body: (block
    [
      (function_definition
        name: (identifier) @constructor)
      (decorated_definition
        definition: (function_definition
          name: (identifier) @constructor))
    ]))
  (#eq? @constructor "__init__"))

(call
  function: (identifier) @function.call)

(call
  function: (attribute
    attribute: (identifier) @function.method.call))

((call
  function: (identifier) @constructor)
  (#match? @constructor "^[A-Z]"))

((call
  function: (attribute
    attribute: (identifier) @constructor))
  (#match? @constructor "^[A-Z]"))

((call
  function: (identifier) @type.builtin)
  (#match? @type.builtin
    "^(BaseException|Exception|BaseExceptionGroup|ExceptionGroup|ArithmeticError|AssertionError|AttributeError|BlockingIOError|BrokenPipeError|BufferError|ChildProcessError|ConnectionAbortedError|ConnectionError|ConnectionRefusedError|ConnectionResetError|EOFError|EnvironmentError|FileExistsError|FileNotFoundError|FloatingPointError|GeneratorExit|IOError|ImportError|IndentationError|IndexError|InterruptedError|IsADirectoryError|KeyError|KeyboardInterrupt|LookupError|MemoryError|ModuleNotFoundError|NameError|NotADirectoryError|NotImplementedError|OSError|OverflowError|PermissionError|ProcessLookupError|PythonFinalizationError|RecursionError|ReferenceError|RuntimeError|StopAsyncIteration|StopIteration|SyntaxError|SystemError|SystemExit|TabError|TimeoutError|TypeError|UnboundLocalError|UnicodeDecodeError|UnicodeEncodeError|UnicodeError|UnicodeTranslateError|ValueError|ZeroDivisionError|Warning|BytesWarning|DeprecationWarning|EncodingWarning|FutureWarning|ImportWarning|PendingDeprecationWarning|ResourceWarning|RuntimeWarning|SyntaxWarning|UnicodeWarning|UserWarning)$"))

((call
  function: (identifier) @function.builtin)
  (#any-of? @function.builtin
    "abs" "aiter" "all" "anext" "any" "ascii" "bin" "breakpoint" "callable"
    "chr" "classmethod" "compile" "delattr" "dir" "divmod" "enumerate" "eval"
    "exec" "filter" "format" "getattr" "globals" "hasattr" "hash" "help" "hex"
    "id" "input" "isinstance" "issubclass" "iter" "len" "locals" "map" "max"
    "min" "next" "oct" "open" "ord" "pow" "print" "property" "repr"
    "reversed" "round" "setattr" "sorted" "staticmethod" "sum" "super" "vars"
    "zip" "__import__"))

((call
  function: (identifier) @type.builtin)
  (#any-of? @type.builtin
    "bool" "bytearray" "bytes" "complex" "dict" "float" "frozenset" "int"
    "list" "memoryview" "object" "range" "set" "slice" "str" "tuple" "type"))

(decorator
  "@" @attribute)

(decorator
  (identifier) @attribute)

(decorator
  (attribute
    attribute: (identifier) @attribute))

(decorator
  (call
    function: (identifier) @attribute))

(decorator
  (call
    function: (attribute
      attribute: (identifier) @attribute)))

; Modules
; -------

(import_statement
  name: (dotted_name
    (identifier) @module))

(import_statement
  name: (aliased_import
    name: (dotted_name
      (identifier) @module)
    alias: (identifier) @module))

(import_from_statement
  module_name: (dotted_name
    (identifier) @module))

(import_from_statement
  module_name: (relative_import
    (dotted_name
      (identifier) @module)))

; Literals
; --------

(comment) @comment

((comment) @keyword.directive
  (#match? @keyword.directive "^\\\\s*#!"))

(string) @string

; A string on its own as the first statement of a module, class or function.
(module
  .
  (expression_statement
    (string) @string.documentation))

(class_definition
  body: (block
    .
    (expression_statement
      (string) @string.documentation)))

(function_definition
  body: (block
    .
    (expression_statement
      (string) @string.documentation)))

(escape_sequence) @string.escape

(escape_interpolation) @string.escape

(integer) @number

(float) @number.float

[
  (true)
  (false)
] @boolean

(none) @constant.builtin

(ellipsis) @constant.builtin

; Punctuation
; -----------

[
  ","
  "."
  ":"
  ";"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(type_parameters
  [
    "["
    "]"
  ] @punctuation.bracket)

(interpolation
  [
    "{"
    "}"
  ] @punctuation.special)

(interpolation
  "=" @punctuation.special)

(type_conversion) @punctuation.special

(format_specifier) @string.special

(format_specifier
  ":" @punctuation.special)

; Operators
; ---------

[
  "-"
  "-="
  "->"
  "!="
  "*"
  "**"
  "**="
  "*="
  "/"
  "//"
  "//="
  "/="
  "&"
  "&="
  "%"
  "%="
  "^"
  "^="
  "+"
  "+="
  "<"
  "<<"
  "<<="
  "<="
  "="
  "=="
  ">"
  ">="
  ">>"
  ">>="
  "|"
  "|="
  "~"
  ":="
  "@="
] @operator

(binary_operator
  operator: "@" @operator)

(keyword_separator) @operator

(positional_separator) @operator

(list_splat
  "*" @operator)

(dictionary_splat
  "**" @operator)

(splat_pattern
  [
    "*"
    "**"
  ] @operator)

(list_splat_pattern
  "*" @operator)

(dictionary_splat_pattern
  "**" @operator)

(wildcard_import) @operator

(import_prefix) @punctuation.delimiter

; Keywords
; --------

[
  "and"
  "in"
  "is"
  "not"
  "or"
  "is not"
  "not in"
] @keyword.operator

[
  "as"
  "assert"
  "del"
  "global"
  "nonlocal"
  "pass"
  "with"
] @keyword

(type_alias_statement
  "type" @keyword.type)

"class" @keyword.type

[
  "def"
  "lambda"
] @keyword.function

[
  "async"
  "await"
] @keyword.coroutine

[
  "return"
  "yield"
] @keyword.return

(yield
  "from" @keyword.return)

[
  "if"
  "elif"
  "else"
  "match"
  "case"
] @keyword.conditional

(conditional_expression
  [
    "if"
    "else"
  ] @keyword.conditional.ternary)

[
  "for"
  "while"
  "break"
  "continue"
] @keyword.repeat

[
  "try"
  "except"
  "finally"
  "raise"
] @keyword.exception

(raise_statement
  "from" @keyword.exception)

(except_group_clause
  "*" @keyword.exception)

[
  "import"
  "lazy"
] @keyword.import

(import_from_statement
  "from" @keyword.import)
`,locals:`; Scopes
; ------

[
  (module)
  (function_definition)
  (lambda)
  (class_definition)
  (list_comprehension)
  (dictionary_comprehension)
  (set_comprehension)
  (generator_expression)
] @local.scope

; Definitions
; -----------

(parameters
  (identifier) @local.definition.parameter)

(lambda_parameters
  (identifier) @local.definition.parameter)

(default_parameter
  name: (identifier) @local.definition.parameter)

(typed_parameter
  (identifier) @local.definition.parameter)

(typed_default_parameter
  name: (identifier) @local.definition.parameter)

(list_splat_pattern
  (identifier) @local.definition.parameter)

(dictionary_splat_pattern
  (identifier) @local.definition.parameter)

(type_parameter
  name: (identifier) @local.definition.type)

(function_definition
  name: (identifier) @local.definition.function)

(class_definition
  name: (identifier) @local.definition.type)

(assignment
  left: (identifier) @local.definition.var)

(assignment
  left: (expression_list
    (identifier) @local.definition.var))

(named_expression
  name: (identifier) @local.definition.var)

(for_statement
  left: (identifier) @local.definition.var)

(for_statement
  left: (expression_list
    (identifier) @local.definition.var))

(for_in_clause
  left: (identifier) @local.definition.var)

(for_in_clause
  left: (expression_list
    (identifier) @local.definition.var))

(with_item
  alias: (identifier) @local.definition.var)

(except_clause
  alias: (identifier) @local.definition.var)

(except_group_clause
  alias: (identifier) @local.definition.var)

(as_pattern
  alias: (identifier) @local.definition.var)

(aliased_import
  alias: (identifier) @local.definition.import)

(import_statement
  name: (dotted_name
    .
    (identifier) @local.definition.import))

(import_from_statement
  name: (dotted_name
    (identifier) @local.definition.import))

; References
; ----------

(identifier) @local.reference
`,tags:`(function_definition
  name: (identifier) @name) @definition.function

(class_definition
  name: (identifier) @name) @definition.class

(class_definition
  body: (block
    (function_definition
      name: (identifier) @name) @definition.method))

(class_definition
  body: (block
    (decorated_definition
      definition: (function_definition
        name: (identifier) @name) @definition.method)))

(type_alias_statement
  name: (identifier) @name) @definition.type

(call
  function: [
    (identifier) @name
    (attribute
      attribute: (identifier) @name)
  ]) @reference.call
`,folds:`[
  (function_definition)
  (class_definition)
  (decorated_definition)
  (if_statement)
  (elif_clause)
  (else_clause)
  (for_statement)
  (while_statement)
  (try_statement)
  (except_clause)
  (except_group_clause)
  (finally_clause)
  (with_statement)
  (match_statement)
  (case_clause)
  (list)
  (tuple)
  (set)
  (dictionary)
  (argument_list)
  (parameters)
  (list_comprehension)
  (dictionary_comprehension)
  (set_comprehension)
  (generator_expression)
  (parenthesized_expression)
  (import_from_statement)
  (string)
] @fold
`}},ruby:{wasm:"tree-sitter-ruby.wasm",title:"Ruby",scope:"source.ruby",fileTypes:["rb","rake","gemspec","ru","rbw","Rakefile","Gemfile","Guardfile","Vagrantfile","Podfile","Brewfile","Capfile","Fastfile","Dangerfile"],injectionRegex:"^(ruby|rb)$",queries:{highlights:`; Highlights for Ruby.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Constants: \`Foo\` names a class or module, \`FOO\` a value.
(constant) @type

((constant) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]*$"))

; Variables
; ---------

[
  (instance_variable)
  (class_variable)
] @variable.member

(global_variable) @variable.builtin

[
  (self)
  (super)
] @variable.builtin

; Parameters
; ----------

(parameters
  (identifier) @variable.parameter)

(method_parameters
  (identifier) @variable.parameter)

(lambda_parameters
  (identifier) @variable.parameter)

(block_parameters
  (identifier) @variable.parameter)

(block_parameters
  locals: (identifier) @variable.parameter)

(destructured_parameter
  (identifier) @variable.parameter)

(optional_parameter
  name: (identifier) @variable.parameter)

(keyword_parameter
  name: (identifier) @variable.parameter)

(splat_parameter
  name: (identifier) @variable.parameter)

(hash_splat_parameter
  name: (identifier) @variable.parameter)

(block_parameter
  name: (identifier) @variable.parameter)

; Calls
; -----

; \`foo?\` and \`foo!\` are always methods.
((identifier) @function.call
  (#match? @function.call "[?!]$"))

(call
  method: [
    (identifier)
    (constant)
  ] @function.call)

(call
  method: (operator) @operator)

; Methods that read like keywords, called without a receiver.
(call
  !receiver
  method: (identifier) @function.builtin
  (#any-of? @function.builtin
    "require" "require_relative" "load" "autoload" "include" "extend"
    "prepend" "attr_reader" "attr_writer" "attr_accessor" "private"
    "protected" "public" "module_function" "private_constant"
    "public_constant" "private_class_method" "public_class_method"
    "define_method" "alias_method" "raise" "fail" "catch" "throw" "loop"
    "lambda" "proc" "puts" "print" "p" "pp" "binding" "block_given?"
    "using" "refine" "freeze" "frozen?" "format" "sprintf" "printf"
    "warn" "exit" "abort" "at_exit" "sleep" "rand" "srand"))

((identifier) @function.builtin
  (#any-of? @function.builtin "block_given?" "binding" "__method__" "__dir__" "__callee__"))

; Definitions
; -----------

(method
  name: [
    (identifier)
    (constant)
  ] @function.method)

(singleton_method
  name: [
    (identifier)
    (constant)
  ] @function.method)

(setter
  name: (identifier) @function.method)

(method
  name: (operator) @function.method)

(singleton_method
  name: (operator) @function.method)

(alias
  name: (identifier) @function.method)

(alias
  alias: (identifier) @function.method)

(class
  name: (constant) @type)

(class
  name: (scope_resolution
    name: (constant) @type))

(module
  name: (constant) @type)

(module
  name: (scope_resolution
    name: (constant) @type))

(superclass
  (constant) @type)

; Hash keys: \`{key: value}\`, \`foo(key: value)\`
(pair
  key: (hash_key_symbol) @property)

(keyword_pattern
  key: (hash_key_symbol) @property)

; Literals
; --------

[
  (string)
  (bare_string)
  (heredoc_body)
] @string

(heredoc_beginning) @label

(subshell) @string.special

[
  (simple_symbol)
  (delimited_symbol)
  (bare_symbol)
] @string.special.symbol

(regex) @string.regexp

(escape_sequence) @string.escape

(character) @character

[
  (integer)
  (float)
  (rational)
  (complex)
] @number

[
  (true)
  (false)
] @boolean

[
  (nil)
  (file)
  (line)
  (encoding)
] @constant.builtin

[
  (comment)
  (uninterpreted)
] @comment

; The code in an interpolation has captures of its own, which win over the
; string around it. Its delimiters are at the end, after punctuation.

; Keywords
; --------

[
  "if"
  "unless"
  "else"
  "elsif"
  "case"
  "when"
  "then"
] @keyword.conditional

(in_clause
  "in" @keyword.conditional)

(if_modifier
  "if" @keyword.conditional)

(unless_modifier
  "unless" @keyword.conditional)

[
  "while"
  "until"
  "for"
  "do"
] @keyword.repeat

(for
  "in" @keyword.repeat)

[
  "begin"
  "rescue"
  "ensure"
  "retry"
] @keyword.exception

[
  "return"
  "yield"
  "break"
  "next"
  "redo"
] @keyword.return

"def" @keyword.function

[
  "class"
  "module"
] @keyword.type

[
  "and"
  "or"
  "not"
  "defined?"
] @keyword.operator

[
  "alias"
  "undef"
  "BEGIN"
  "END"
  "end"
] @keyword

(test_pattern
  "in" @keyword.operator)

; Operators and punctuation
; -------------------------

[
  "="
  "+="
  "-="
  "*="
  "**="
  "/="
  "%="
  "||="
  "&&="
  "|="
  "&="
  "^="
  "<<="
  ">>="
  "=="
  "!="
  "==="
  "<=>"
  "=~"
  "!~"
  "<"
  "<="
  ">"
  ">="
  "+"
  "-"
  "*"
  "**"
  "/"
  "%"
  "!"
  "~"
  "&"
  "^"
  "<<"
  ">>"
  "&&"
  "||"
  ".."
  "..."
  "=>"
  "->"
  "?"
] @operator

(binary
  operator: "|" @operator)

(alternative_pattern
  "|" @operator)

(conditional
  ":" @operator)

(splat_argument
  "*" @operator)

(hash_splat_argument
  "**" @operator)

(block_argument
  "&" @operator)

(variable_reference_pattern
  "^" @operator)

(expression_reference_pattern
  "^" @operator)

[
  ","
  ";"
  "."
  "&."
  "::"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(block_parameters
  "|" @punctuation.bracket)

(block_parameters
  "||" @punctuation.bracket)

; \`/\` also delimits a regex.
(regex
  "/" @string.regexp)

(interpolation
  [
    "#{"
    "}"
  ] @punctuation.special)

(interpolation
  "#" @punctuation.special)
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))
`,locals:`; Scopes
; ------

[
  (program)
  (method)
  (singleton_method)
  (class)
  (singleton_class)
  (module)
  (block)
  (do_block)
  (lambda)
] @local.scope

; Definitions
; -----------

(assignment
  left: (identifier) @local.definition.var)

(operator_assignment
  left: (identifier) @local.definition.var)

(left_assignment_list
  (identifier) @local.definition.var)

(rest_assignment
  (identifier) @local.definition.var)

(destructured_left_assignment
  (identifier) @local.definition.var)

(for
  pattern: (identifier) @local.definition.var)

(exception_variable
  (identifier) @local.definition.var)

(parameters
  (identifier) @local.definition.parameter)

(method_parameters
  (identifier) @local.definition.parameter)

(lambda_parameters
  (identifier) @local.definition.parameter)

(block_parameters
  (identifier) @local.definition.parameter)

(destructured_parameter
  (identifier) @local.definition.parameter)

(optional_parameter
  name: (identifier) @local.definition.parameter)

(keyword_parameter
  name: (identifier) @local.definition.parameter)

(splat_parameter
  name: (identifier) @local.definition.parameter)

(hash_splat_parameter
  name: (identifier) @local.definition.parameter)

(block_parameter
  name: (identifier) @local.definition.parameter)

; References
; ----------

(identifier) @local.reference
`,tags:`(method
  name: (_) @name) @definition.method

(singleton_method
  name: (_) @name) @definition.method

(alias
  name: (_) @name) @definition.method

(class
  name: [
    (constant) @name
    (scope_resolution
      name: (_) @name)
  ]) @definition.class

(module
  name: [
    (constant) @name
    (scope_resolution
      name: (_) @name)
  ]) @definition.module

(assignment
  left: (constant) @name) @definition.constant

(call
  method: [
    (identifier)
    (constant)
  ] @name) @reference.call

(superclass
  (constant) @name) @reference.class
`,folds:`[
  (method)
  (singleton_method)
  (class)
  (singleton_class)
  (module)
  (if)
  (unless)
  (while)
  (until)
  (for)
  (case)
  (case_match)
  (when)
  (in_clause)
  (begin)
  (do_block)
  (block)
  (lambda)
  (array)
  (hash)
  (argument_list)
  (heredoc_body)
  (comment)
] @fold
`}},rust:{wasm:"tree-sitter-rust.wasm",title:"Rust",scope:"source.rust",fileTypes:["rs"],injectionRegex:"^rust$",queries:{highlights:`; Highlights for Rust.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

(metavariable) @variable

(self) @variable.builtin

; Names by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z]"))

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

; Types
; -----

(type_identifier) @type

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "bool" "char" "str" "u8" "u16" "u32" "u64" "u128" "usize"
    "i8" "i16" "i32" "i64" "i128" "isize" "f16" "f32" "f64" "f128"))

((identifier) @type.builtin
  (#any-of? @type.builtin
    "bool" "char" "str" "u8" "u16" "u32" "u64" "u128" "usize"
    "i8" "i16" "i32" "i64" "i128" "isize" "f16" "f32" "f64" "f128"))

((type_identifier) @type.builtin
  (#eq? @type.builtin "Self"))

((identifier) @type.builtin
  (#eq? @type.builtin "Self"))

(inferred_type) @type.builtin

(never_type) @type.builtin

(lifetime) @label

(label) @label

; Paths
; -----

; Modules and crates in paths are highlighted as types.

(scoped_identifier
  path: (identifier) @type)

(scoped_type_identifier
  path: (identifier) @type)

; The middle parts of a path: \`collections\` in \`std::collections::HashMap\`.
(scoped_identifier
  path: (scoped_identifier
    name: (identifier) @type))

(scoped_type_identifier
  path: (scoped_identifier
    name: (identifier) @type))

(scoped_use_list
  path: (scoped_identifier
    name: (identifier) @type))

(use_wildcard
  (scoped_identifier
    name: (identifier) @type))

(use_wildcard
  (identifier) @type)

(scoped_use_list
  path: (identifier) @type)

(use_declaration
  argument: (identifier) @type)

(use_declaration
  argument: (scoped_identifier
    name: (identifier) @type))

(use_as_clause
  path: (identifier) @type)

(use_list
  (identifier) @type)

(mod_item
  name: (identifier) @type)

(extern_crate_declaration
  name: (identifier) @type)

(extern_crate_declaration
  alias: (identifier) @type)

; Names in a path that look like types or constants keep that look.
(scoped_identifier
  path: (identifier) @type
  (#match? @type "^[A-Z]"))

(scoped_identifier
  name: (identifier) @type
  (#match? @type "^[A-Z]"))

(scoped_identifier
  name: (identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

(scoped_type_identifier
  path: (identifier) @type
  (#match? @type "^[A-Z]"))

((use_declaration
  argument: (scoped_identifier
    name: (identifier) @type))
  (#match? @type "^[A-Z]"))

((use_list
  (identifier) @type)
  (#match? @type "^[A-Z]"))

; Fields, parameters and variants
; -------------------------------

(field_identifier) @property

(shorthand_field_identifier) @property

; Field accesses (\`self.rest\`) are variables; field declarations and
; initializers stay properties. Method calls are matched further down.
(field_expression
  field: (field_identifier) @variable)

(shorthand_field_initializer
  (identifier) @property)

(parameter
  pattern: (identifier) @variable.parameter)

(parameter
  pattern: (mut_pattern
    (identifier) @variable.parameter))

(parameter
  pattern: (ref_pattern
    (identifier) @variable.parameter))

(closure_parameters
  (identifier) @variable.parameter)

(enum_variant
  name: (identifier) @constant)

(const_item
  name: (identifier) @constant)

(static_item
  name: (identifier) @constant)

(const_parameter
  name: (identifier) @constant)

; Functions
; ---------

(function_item
  name: (identifier) @function)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (scoped_identifier
    name: (identifier) @function.call))

(call_expression
  function: (field_expression
    field: (field_identifier) @function.method.call))

(generic_function
  function: (identifier) @function.call)

(generic_function
  function: (scoped_identifier
    name: (identifier) @function.call))

(generic_function
  function: (field_expression
    field: (field_identifier) @function.method.call))

(macro_invocation
  macro: (identifier) @tag
  "!" @tag)

(macro_invocation
  macro: (scoped_identifier
    name: (identifier) @tag)
  "!" @tag)

(macro_definition
  name: (identifier) @tag)

; Attributes
; ----------

(attribute_item) @attribute

(inner_attribute_item) @attribute

(attribute
  (identifier) @attribute)

(attribute
  (scoped_identifier
    name: (identifier) @attribute))

; Comments
; --------

(line_comment) @comment

(block_comment) @comment

(doc_comment) @comment.documentation

((block_comment) @comment.documentation
  (#match? @comment.documentation "^/[*][*][^*/]|^/[*]!"))

(shebang) @keyword.directive

; Literals
; --------

(string_literal) @string

(raw_string_literal) @string

(escape_sequence) @string.escape

(char_literal) @character

(integer_literal) @number

(float_literal) @number.float

(boolean_literal) @boolean

; Keywords
; --------

[
  "as"
  "box"
  "default"
  "dyn"
  "impl"
  "in"
  "move"
  "raw"
  "ref"
  "safe"
  "union"
  "use"
  "where"
  "yeet"
  "do"
  "gen"
  "auto"
  "final"
  "let"
  "macro_rules"
  "macro"
  (mutable_specifier)
  (ref_specifier)
] @keyword

[
  "struct"
  "enum"
  "trait"
  "type"
] @keyword.type

[
  "const"
  "static"
  "extern"
  "unsafe"
  "pub"
  (visibility_modifier)
] @keyword.modifier

"fn" @keyword.function

[
  "mod"
  "crate"
] @keyword.import

(use_declaration
  "use" @keyword.import)

(extern_crate_declaration
  "extern" @keyword.import)

[
  "async"
  "await"
] @keyword.coroutine

[
  "return"
  "yield"
  "become"
] @keyword.return

[
  "if"
  "else"
  "match"
] @keyword.conditional

[
  "loop"
  "while"
  "for"
  "break"
  "continue"
] @keyword.repeat

"try" @keyword.exception

(for_lifetimes
  "for" @keyword)

(higher_ranked_trait_bound
  (for_lifetimes
    "for" @keyword))

(impl_item
  "for" @keyword)

(crate) @keyword.import

(super) @keyword.import

; Operators
; ---------

[
  "+" "-" "*" "/" "%" "^" "!" "&" "|" "&&" "||" "<<" ">>"
  "+=" "-=" "*=" "/=" "%=" "^=" "&=" "|=" "<<=" ">>=" "="
  "==" "!=" ">" "<" ">=" "<=" "@" ".." "..=" "..." "?" "->" "=>"
] @operator

(closure_parameters
  "|" @punctuation.bracket)

(type_arguments
  ["<" ">"] @punctuation.bracket)

(type_parameters
  ["<" ">"] @punctuation.bracket)

(for_lifetimes
  ["<" ">"] @punctuation.bracket)

(bracketed_type
  ["<" ">"] @punctuation.bracket)

(reference_type
  "&" @operator)

(pointer_type
  "*" @operator)

; Punctuation
; -----------

["(" ")" "[" "]" "{" "}"] @punctuation.bracket

["," "." ":" "::" ";"] @punctuation.delimiter

(attribute_item
  "#" @punctuation.special)

(inner_attribute_item
  ["#" "!"] @punctuation.special)

; Macro bodies
; ------------

; A token tree is not parsed, so its punctuation keeps a neutral color.
(token_tree
  ["(" ")" "[" "]" "{" "}"] @punctuation.bracket)

(macro_invocation
  "!" @tag)

(macro_definition
  "!" @tag)

; A name followed by \`(..)\` in a token tree is most likely a call, a tuple
; struct or enum variant included:
; \`format!("{}", f(x))\` and \`self.area()\`.
(token_tree
  (identifier) @function.call
  .
  (token_tree
    .
    "("))

(token_tree
  "."
  .
  (identifier) @function.method.call
  .
  (token_tree
    .
    "("))

(token_tree
  "self" @variable.builtin)

; \`name!\` in a token tree is a macro.
(token_tree
  (identifier) @tag
  .
  "!" @tag)
`,injections:`([
  (line_comment)
  (block_comment)
] @injection.content
  (#set! injection.language "comment"))

; The body of a macro invocation is a token tree; reparse it as Rust.
(macro_invocation
  (token_tree) @injection.content
  (#set! injection.language "rust")
  (#set! injection.include-children))
`,locals:`; Scopes
; ------

[
  (source_file)
  (function_item)
  (closure_expression)
  (block)
  (if_expression)
  (match_arm)
  (for_expression)
  (while_expression)
  (loop_expression)
  (impl_item)
  (trait_item)
] @local.scope

; Definitions
; -----------

(parameter
  pattern: (identifier) @local.definition.parameter)

(parameter
  pattern: (mut_pattern
    (identifier) @local.definition.parameter))

(closure_parameters
  (identifier) @local.definition.parameter)

(self_parameter
  (self) @local.definition.parameter)

(let_declaration
  pattern: (identifier) @local.definition.var)

(let_declaration
  pattern: (mut_pattern
    (identifier) @local.definition.var))

(let_condition
  pattern: (identifier) @local.definition.var)

(for_expression
  pattern: (identifier) @local.definition.var)

(tuple_pattern
  (identifier) @local.definition.var)

(tuple_struct_pattern
  (identifier) @local.definition.var)

(slice_pattern
  (identifier) @local.definition.var)

(captured_pattern
  .
  (identifier) @local.definition.var)

(field_pattern
  name: (shorthand_field_identifier) @local.definition.var)

(field_pattern
  pattern: (identifier) @local.definition.var)

(type_parameter
  name: (type_identifier) @local.definition.type)

(const_parameter
  name: (identifier) @local.definition.constant)

(function_item
  name: (identifier) @local.definition.function)

; References
; ----------

(identifier) @local.reference

(type_identifier) @local.reference
`,tags:`; Definitions
; -----------

(function_item
  name: (identifier) @name) @definition.function

(declaration_list
  (function_item
    name: (identifier) @name) @definition.method)

(struct_item
  name: (type_identifier) @name) @definition.class

(union_item
  name: (type_identifier) @name) @definition.class

(enum_item
  name: (type_identifier) @name) @definition.class

(enum_variant
  name: (identifier) @name) @definition.constant

(trait_item
  name: (type_identifier) @name) @definition.interface

(trait_alias_item
  name: (type_identifier) @name) @definition.interface

(type_item
  name: (type_identifier) @name) @definition.type

(field_declaration
  name: (field_identifier) @name) @definition.field

(const_item
  name: (identifier) @name) @definition.constant

(static_item
  name: (identifier) @name) @definition.constant

(mod_item
  name: (identifier) @name) @definition.module

(macro_definition
  name: (identifier) @name) @definition.macro

(impl_item
  type: [
    (type_identifier) @name
    (generic_type type: (type_identifier) @name)
    (scoped_type_identifier name: (type_identifier) @name)
  ]) @reference.implementation

; References
; ----------

(call_expression
  function: [
    (identifier) @name
    (scoped_identifier name: (identifier) @name)
    (field_expression field: (field_identifier) @name)
    (generic_function function: [
      (identifier) @name
      (scoped_identifier name: (identifier) @name)
      (field_expression field: (field_identifier) @name)
    ])
  ]) @reference.call

(macro_invocation
  macro: [
    (identifier) @name
    (scoped_identifier name: (identifier) @name)
  ]) @reference.call

(impl_item
  trait: [
    (type_identifier) @name
    (generic_type type: (type_identifier) @name)
    (scoped_type_identifier name: (type_identifier) @name)
  ]) @reference.implementation
`,folds:`[
  (block)
  (declaration_list)
  (field_declaration_list)
  (ordered_field_declaration_list)
  (enum_variant_list)
  (field_initializer_list)
  (match_block)
  (match_arm)
  (token_tree)
  (use_list)
  (parameters)
  (arguments)
  (array_expression)
  (tuple_expression)
  (block_comment)
] @fold
`}},scss:{wasm:"tree-sitter-scss.wasm",title:"SCSS",scope:"source.scss",fileTypes:["scss"],injectionRegex:"^s?css$",queries:{highlights:`; Highlights for SCSS.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

; Values
; ------

(identifier) @constant

; Custom property references: \`var(--gap)\`.
((identifier) @property
  (#match? @property "^--"))

(interpolated_identifier) @constant

(string) @string

(escape_sequence) @string.escape

(url) @string.special.path

(color) @constant

(number) @number

(unicode_range) @number

(boolean) @boolean

(null) @constant.builtin

(variable) @variable

(module) @module

(keyword_argument
  name: (variable) @variable.parameter)

(parameter
  name: (variable) @variable.parameter)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (namespaced_name
    name: (identifier) @function.call))

(if_expression
  "if" @function.builtin)

(if_branch
  condition: (identifier) @keyword.conditional
  (#eq? @keyword.conditional "else"))

; Selectors
; ---------

(tag_name) @tag

(universal_selector) @tag

(nesting_selector) @variable.builtin

(nesting_selector
  (suffix) @type)

(class_name) @type

(id_name) @constant

(placeholder_name) @type

(attribute_name) @property

(pseudo_class_name) @type

(pseudo_element_name) @type

(nth) @number

; The plain parts of a name with interpolation in it.
(tag_name (identifier) @tag)
(class_name (identifier) @type)
(id_name (identifier) @constant)
(placeholder_name (identifier) @type)
(attribute_name (identifier) @property)
(pseudo_class_name (identifier) @type)
(pseudo_element_name (identifier) @type)

(keyframe_selectors) @attribute

(keyframe_selectors
  (number) @number)

; Declarations
; ------------

(property_name) @property

(property_name (identifier) @property)

(variable_declaration
  name: (variable) @variable)

(variable_declaration
  name: (namespaced_variable
    name: (variable) @variable))

(feature_query
  feature: (property_name) @property)

(keyword_query) @constant.builtin

; Definitions
; -----------

(mixin_statement
  name: (identifier) @function)

(function_statement
  name: (identifier) @function)

(include_statement
  name: (identifier) @function.call)

(include_statement
  name: (namespaced_name
    name: (identifier) @function.call))

(use_statement
  namespace: (identifier) @module)

(forward_prefix) @module

(forward_statement
  (identifier) @function)

; Keywords
; --------

[
  "@use"
  "@forward"
  "@import"
] @keyword.import

[
  "@mixin"
  "@function"
] @keyword.function

"@return" @keyword.return

[
  "@if"
  "@else"
  "@elseif"
] @keyword.conditional

(else_if_clause
  "if" @keyword.conditional)

[
  "@each"
  "@for"
  "@while"
] @keyword.repeat

[
  "@error"
  "@warn"
] @keyword.exception

[
  "@include"
  "@content"
  "@extend"
  "@debug"
  "@at-root"
  "@media"
  "@supports"
  "@container"
  "@page"
  "@scope"
  "@charset"
  (keyframes_keyword)
  (at_keyword)
] @keyword.directive

[
  "as"
  "with"
  "without"
  "show"
  "hide"
  "using"
  "in"
  "from"
  "through"
  "to"
  "of"
  "selector"
] @keyword

(keyframe_selectors
  [
    "from"
    "to"
  ] @attribute)

[
  "and"
  "or"
  "not"
  "only"
] @keyword.operator

[
  (important)
  (default_flag)
  (global_flag)
  (optional_flag)
] @keyword.modifier

; Operators and punctuation
; -------------------------

[
  "+"
  "-"
  "*"
  "/"
  "%"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "="
  "~"
  "~="
  "|="
  "^="
  "$="
  "*="
  "..."
] @operator

(placeholder_selector
  "%" @punctuation.delimiter)

[
  "{"
  "}"
  "("
  ")"
  "["
  "]"
] @punctuation.bracket

[
  ","
  ";"
  ":"
  "."
  "#"
  "::"
] @punctuation.delimiter

(interpolation
  [
    "#{"
    "}"
  ] @punctuation.special)

(comment) @comment

(single_line_comment) @comment
`,injections:`([
  (comment)
  (single_line_comment)
] @injection.content
  (#set! injection.language "comment"))
`,locals:`; Scopes
; ------

[
  (stylesheet)
  (block)
  (mixin_statement)
  (function_statement)
  (each_statement)
  (for_statement)
  (include_statement)
] @local.scope

; Definitions
; -----------

(parameter
  name: (variable) @local.definition.parameter)

(variable_declaration
  name: (variable) @local.definition.var)

(each_statement
  (variable) @local.definition.var)

(for_statement
  variable: (variable) @local.definition.var)

; References
; ----------

(variable) @local.reference
`,tags:`(mixin_statement
  name: (identifier) @name) @definition.macro

(function_statement
  name: (identifier) @name) @definition.function

(stylesheet
  (variable_declaration
    name: (variable) @name) @definition.constant)

(stylesheet
  (rule_set
    selectors: (selectors
      (placeholder_selector
        name: (placeholder_name) @name))) @definition.class)

(include_statement
  name: [
    (identifier) @name
    (namespaced_name
      name: (identifier) @name)
  ]) @reference.call

(call_expression
  function: [
    (identifier) @name
    (namespaced_name
      name: (identifier) @name)
  ]) @reference.call

(extend_statement
  (selectors
    (placeholder_selector
      name: (placeholder_name) @name))) @reference.class
`,folds:`[
  (block)
  (map)
  (arguments)
  (parameters)
  (comment)
] @fold
`}},sql:{wasm:"tree-sitter-sql.wasm",title:"SQL",scope:"source.sql",fileTypes:["sql","pgsql","psql","mysql","sqlite"],injectionRegex:"^(sql|pgsql|postgres(ql)?|psql|mysql|sqlite3?|plpgsql)$",queries:{highlights:`; Highlights for SQL.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Words that are keywords but lexed as names: in their own nodes, and in
; runs of plain tokens (\`GRANT ...\`, \`CREATE SEQUENCE ...\`, \`VACUUM ...\`)
; when they are SQL keywords. The list is generated by
; script/update-keywords.py.
[
  (keyword)
  (object_kind)
  (command)
] @keyword

; soft keywords: begin
([
  (create_statement
    (identifier) @keyword)
  (alter_statement
    (identifier) @keyword)
  (drop_statement
    (identifier) @keyword)
  (other_statement
    (identifier) @keyword)
  (transaction_statement
    (identifier) @keyword)
  (set_statement
    (identifier) @keyword)
  (alter_table_action
    (identifier) @keyword)
  (alter_column
    (identifier) @keyword)
  (comment_statement
    (identifier) @keyword)
  (token_group
    (identifier) @keyword)
  (json_clauses
    (identifier) @keyword)
]
  (#any-of? @keyword
    "abort" "absent" "absolute" "access" "action" "add" "admin" "after"
    "aggregate" "all" "also" "alter" "always" "analyse" "analyze" "and" "any"
    "apply" "array" "as" "asc" "asensitive" "assignment" "asymmetric" "at"
    "atomic" "attach" "attribute" "authorization" "auto_increment"
    "autoincrement" "backward" "before" "begin" "between" "bigint" "binary"
    "both" "breadth" "btree" "buffers" "by" "bypassrls" "cache" "call"
    "called" "cascade" "cascaded" "case" "cast" "catalog" "chain" "change"
    "character" "characteristics" "charset" "check" "checkpoint" "class"
    "close" "cluster" "collate" "collation" "column" "columns" "comment"
    "comments" "commit" "committed" "compression" "concurrently" "conditional"
    "configuration" "conflict" "connect" "connection" "constraint"
    "constraints" "content" "continue" "conversion" "copy" "cost" "costs"
    "create" "createdb" "createrole" "cross" "csv" "cube" "current" "cursor"
    "cycle" "database" "databases" "deallocate" "declare" "default" "defaults"
    "deferrable" "deferred" "definer" "delayed" "delete" "delimiter"
    "delimiters" "depends" "depth" "desc" "describe" "detach" "dictionary"
    "disable" "discard" "distinct" "div" "do" "document" "domain" "drop"
    "duplicate" "each" "else" "empty" "enable" "encoding" "encrypted" "end"
    "enforced" "engine" "enum" "error" "escape" "event" "except" "exclude"
    "excluding" "exclusive" "exec" "execute" "exists" "explain" "expression"
    "extension" "external" "fail" "false" "family" "fetch" "filter" "finalize"
    "first" "flush" "following" "for" "force" "force_not_null" "force_null"
    "force_quote" "foreign" "format" "forward" "freeze" "from" "full"
    "fulltext" "function" "functions" "generated" "generic_plan" "glob"
    "global" "grant" "granted" "grants" "group" "grouping" "groups" "handler"
    "hash" "having" "header" "high_priority" "hold" "identity" "if" "ignore"
    "ilike" "immediate" "immutable" "implicit" "import" "in" "include"
    "including" "increment" "indent" "index" "indexed" "inherit" "inherits"
    "initially" "inline" "inner" "inout" "input" "insensitive" "insert"
    "instead" "intersect" "into" "invisible" "invoker" "is" "isnull"
    "isolation" "join" "json" "keep" "keys" "kill" "label" "language" "large"
    "last" "lateral" "leading" "leakproof" "left" "level" "like" "limit"
    "listen" "load" "local" "location" "lock" "locked" "logged" "login"
    "low_priority" "main" "mapping" "match" "matched" "materialized"
    "maxvalue" "merge" "method" "minus" "minvalue" "mod" "mode" "modify"
    "move" "names" "natural" "new" "next" "nfc" "nfd" "nfkc" "nfkd" "no"
    "nologin" "none" "normalized" "not" "nothing" "notify" "notnull" "nowait"
    "null" "nulls" "object" "of" "off" "offset" "oids" "old" "omit" "on"
    "only" "operator" "optimize" "option" "options" "or" "order" "ordinality"
    "others" "out" "outer" "over" "overlaps" "overriding" "owned" "owner"
    "parallel" "parser" "partial" "partition" "passing" "password" "period"
    "permissive" "persist" "placing" "plain" "plan" "plans" "policy" "pragma"
    "preceding" "precision" "prepare" "prepared" "preserve" "primary" "prior"
    "privileges" "procedural" "procedure" "procedures" "processlist" "program"
    "provider" "public" "publication" "qualify" "query" "quick" "quotes"
    "range" "read" "reassign" "recursive" "ref" "references" "referencing"
    "refresh" "regexp" "reindex" "relative" "release" "rename" "repack"
    "repair" "repeatable" "replace" "replica" "replication" "reset" "respect"
    "restart" "restrict" "restrictive" "return" "returning" "returns" "revoke"
    "right" "rlike" "role" "rollback" "rollup" "routine" "routines" "row"
    "rows" "rule" "savepoint" "scalar" "schema" "schemas" "scroll" "search"
    "security" "select" "separator" "sequence" "sequences" "serializable"
    "server" "session" "set" "setof" "sets" "settings" "share" "show"
    "similar" "simple" "skip" "snapshot" "some" "source" "spatial" "stable"
    "start" "statement" "statistics" "status" "stdin" "stdout" "storage"
    "stored" "straight_join" "strict" "subscription" "summary" "superuser"
    "support" "symmetric" "sysid" "system" "table" "tables" "tablesample"
    "tablespace" "temp" "template" "temporary" "then" "ties" "timing" "to"
    "trailing" "transaction" "transform" "trigger" "true" "truncate" "trusted"
    "try_cast" "type" "types" "uescape" "unbounded" "uncommitted"
    "unconditional" "union" "unique" "unlisten" "unlock" "unlogged" "unsigned"
    "until" "update" "usage" "use" "user" "using" "vacuum" "valid" "validate"
    "validator" "values" "variables" "variadic" "varying" "verbose" "version"
    "view" "views" "virtual" "visible" "volatile" "wal" "when" "where"
    "window" "with" "within" "without" "work" "wrapper" "write" "xml" "xor"
    "yaml" "zerofill" "ABORT" "ABSENT" "ABSOLUTE" "ACCESS" "ACTION" "ADD"
    "ADMIN" "AFTER" "AGGREGATE" "ALL" "ALSO" "ALTER" "ALWAYS" "ANALYSE"
    "ANALYZE" "AND" "ANY" "APPLY" "ARRAY" "AS" "ASC" "ASENSITIVE" "ASSIGNMENT"
    "ASYMMETRIC" "AT" "ATOMIC" "ATTACH" "ATTRIBUTE" "AUTHORIZATION"
    "AUTO_INCREMENT" "AUTOINCREMENT" "BACKWARD" "BEFORE" "BEGIN" "BETWEEN"
    "BIGINT" "BINARY" "BOTH" "BREADTH" "BTREE" "BUFFERS" "BY" "BYPASSRLS"
    "CACHE" "CALL" "CALLED" "CASCADE" "CASCADED" "CASE" "CAST" "CATALOG"
    "CHAIN" "CHANGE" "CHARACTER" "CHARACTERISTICS" "CHARSET" "CHECK"
    "CHECKPOINT" "CLASS" "CLOSE" "CLUSTER" "COLLATE" "COLLATION" "COLUMN"
    "COLUMNS" "COMMENT" "COMMENTS" "COMMIT" "COMMITTED" "COMPRESSION"
    "CONCURRENTLY" "CONDITIONAL" "CONFIGURATION" "CONFLICT" "CONNECT"
    "CONNECTION" "CONSTRAINT" "CONSTRAINTS" "CONTENT" "CONTINUE" "CONVERSION"
    "COPY" "COST" "COSTS" "CREATE" "CREATEDB" "CREATEROLE" "CROSS" "CSV"
    "CUBE" "CURRENT" "CURSOR" "CYCLE" "DATABASE" "DATABASES" "DEALLOCATE"
    "DECLARE" "DEFAULT" "DEFAULTS" "DEFERRABLE" "DEFERRED" "DEFINER" "DELAYED"
    "DELETE" "DELIMITER" "DELIMITERS" "DEPENDS" "DEPTH" "DESC" "DESCRIBE"
    "DETACH" "DICTIONARY" "DISABLE" "DISCARD" "DISTINCT" "DIV" "DO" "DOCUMENT"
    "DOMAIN" "DROP" "DUPLICATE" "EACH" "ELSE" "EMPTY" "ENABLE" "ENCODING"
    "ENCRYPTED" "END" "ENFORCED" "ENGINE" "ENUM" "ERROR" "ESCAPE" "EVENT"
    "EXCEPT" "EXCLUDE" "EXCLUDING" "EXCLUSIVE" "EXEC" "EXECUTE" "EXISTS"
    "EXPLAIN" "EXPRESSION" "EXTENSION" "EXTERNAL" "FAIL" "FALSE" "FAMILY"
    "FETCH" "FILTER" "FINALIZE" "FIRST" "FLUSH" "FOLLOWING" "FOR" "FORCE"
    "FORCE_NOT_NULL" "FORCE_NULL" "FORCE_QUOTE" "FOREIGN" "FORMAT" "FORWARD"
    "FREEZE" "FROM" "FULL" "FULLTEXT" "FUNCTION" "FUNCTIONS" "GENERATED"
    "GENERIC_PLAN" "GLOB" "GLOBAL" "GRANT" "GRANTED" "GRANTS" "GROUP"
    "GROUPING" "GROUPS" "HANDLER" "HASH" "HAVING" "HEADER" "HIGH_PRIORITY"
    "HOLD" "IDENTITY" "IF" "IGNORE" "ILIKE" "IMMEDIATE" "IMMUTABLE" "IMPLICIT"
    "IMPORT" "IN" "INCLUDE" "INCLUDING" "INCREMENT" "INDENT" "INDEX" "INDEXED"
    "INHERIT" "INHERITS" "INITIALLY" "INLINE" "INNER" "INOUT" "INPUT"
    "INSENSITIVE" "INSERT" "INSTEAD" "INTERSECT" "INTO" "INVISIBLE" "INVOKER"
    "IS" "ISNULL" "ISOLATION" "JOIN" "JSON" "KEEP" "KEYS" "KILL" "LABEL"
    "LANGUAGE" "LARGE" "LAST" "LATERAL" "LEADING" "LEAKPROOF" "LEFT" "LEVEL"
    "LIKE" "LIMIT" "LISTEN" "LOAD" "LOCAL" "LOCATION" "LOCK" "LOCKED" "LOGGED"
    "LOGIN" "LOW_PRIORITY" "MAIN" "MAPPING" "MATCH" "MATCHED" "MATERIALIZED"
    "MAXVALUE" "MERGE" "METHOD" "MINUS" "MINVALUE" "MOD" "MODE" "MODIFY"
    "MOVE" "NAMES" "NATURAL" "NEW" "NEXT" "NFC" "NFD" "NFKC" "NFKD" "NO"
    "NOLOGIN" "NONE" "NORMALIZED" "NOT" "NOTHING" "NOTIFY" "NOTNULL" "NOWAIT"
    "NULL" "NULLS" "OBJECT" "OF" "OFF" "OFFSET" "OIDS" "OLD" "OMIT" "ON"
    "ONLY" "OPERATOR" "OPTIMIZE" "OPTION" "OPTIONS" "OR" "ORDER" "ORDINALITY"
    "OTHERS" "OUT" "OUTER" "OVER" "OVERLAPS" "OVERRIDING" "OWNED" "OWNER"
    "PARALLEL" "PARSER" "PARTIAL" "PARTITION" "PASSING" "PASSWORD" "PERIOD"
    "PERMISSIVE" "PERSIST" "PLACING" "PLAIN" "PLAN" "PLANS" "POLICY" "PRAGMA"
    "PRECEDING" "PRECISION" "PREPARE" "PREPARED" "PRESERVE" "PRIMARY" "PRIOR"
    "PRIVILEGES" "PROCEDURAL" "PROCEDURE" "PROCEDURES" "PROCESSLIST" "PROGRAM"
    "PROVIDER" "PUBLIC" "PUBLICATION" "QUALIFY" "QUERY" "QUICK" "QUOTES"
    "RANGE" "READ" "REASSIGN" "RECURSIVE" "REF" "REFERENCES" "REFERENCING"
    "REFRESH" "REGEXP" "REINDEX" "RELATIVE" "RELEASE" "RENAME" "REPACK"
    "REPAIR" "REPEATABLE" "REPLACE" "REPLICA" "REPLICATION" "RESET" "RESPECT"
    "RESTART" "RESTRICT" "RESTRICTIVE" "RETURN" "RETURNING" "RETURNS" "REVOKE"
    "RIGHT" "RLIKE" "ROLE" "ROLLBACK" "ROLLUP" "ROUTINE" "ROUTINES" "ROW"
    "ROWS" "RULE" "SAVEPOINT" "SCALAR" "SCHEMA" "SCHEMAS" "SCROLL" "SEARCH"
    "SECURITY" "SELECT" "SEPARATOR" "SEQUENCE" "SEQUENCES" "SERIALIZABLE"
    "SERVER" "SESSION" "SET" "SETOF" "SETS" "SETTINGS" "SHARE" "SHOW"
    "SIMILAR" "SIMPLE" "SKIP" "SNAPSHOT" "SOME" "SOURCE" "SPATIAL" "STABLE"
    "START" "STATEMENT" "STATISTICS" "STATUS" "STDIN" "STDOUT" "STORAGE"
    "STORED" "STRAIGHT_JOIN" "STRICT" "SUBSCRIPTION" "SUMMARY" "SUPERUSER"
    "SUPPORT" "SYMMETRIC" "SYSID" "SYSTEM" "TABLE" "TABLES" "TABLESAMPLE"
    "TABLESPACE" "TEMP" "TEMPLATE" "TEMPORARY" "THEN" "TIES" "TIMING" "TO"
    "TRAILING" "TRANSACTION" "TRANSFORM" "TRIGGER" "TRUE" "TRUNCATE" "TRUSTED"
    "TRY_CAST" "TYPE" "TYPES" "UESCAPE" "UNBOUNDED" "UNCOMMITTED"
    "UNCONDITIONAL" "UNION" "UNIQUE" "UNLISTEN" "UNLOCK" "UNLOGGED" "UNSIGNED"
    "UNTIL" "UPDATE" "USAGE" "USE" "USER" "USING" "VACUUM" "VALID" "VALIDATE"
    "VALIDATOR" "VALUES" "VARIABLES" "VARIADIC" "VARYING" "VERBOSE" "VERSION"
    "VIEW" "VIEWS" "VIRTUAL" "VISIBLE" "VOLATILE" "WAL" "WHEN" "WHERE"
    "WINDOW" "WITH" "WITHIN" "WITHOUT" "WORK" "WRAPPER" "WRITE" "XML" "XOR"
    "YAML" "ZEROFILL"))

; soft keywords: end

; Names
; -----

; Tables, views and other relations.
(object_reference
  name: (identifier) @type)

(object_reference
  schema: (identifier) @module)

(object_reference
  database: (identifier) @module)

(column_reference
  name: (identifier) @property)

(column_reference
  schema: (identifier) @module)

(column_reference
  database: (identifier) @module)

(field_selection
  field: (identifier) @property)

(column_definition
  name: (identifier) @property)

(column_list
  (identifier) @property)

(assignment
  left: (identifier) @property)

(alter_column
  name: (identifier) @property)

(drop_column
  name: (identifier) @property)

(rename
  old: (identifier) @property)

(rename
  new: (identifier) @property)

(cte
  name: (identifier) @type)

(type
  name: (identifier) @type)

(type
  schema: (identifier) @module)

((type
  name: (identifier) @type.builtin)
  (#any-of? @type.builtin
    "bigint" "bigserial" "bit" "blob" "bool" "boolean" "box" "bytea" "char"
    "character" "cidr" "circle" "date" "datetime" "decimal" "double" "float"
    "float4" "float8" "inet" "int" "int2" "int4" "int8" "integer" "interval"
    "json" "jsonb" "line" "lseg" "macaddr" "money" "nchar" "numeric"
    "nvarchar" "oid" "path" "point" "polygon" "real" "record" "regclass"
    "serial" "smallint" "smallserial" "text" "time" "timestamp" "timestamptz"
    "timetz" "tinyint" "tsquery" "tsvector" "uuid" "varbinary" "varchar"
    "void" "xml" "BIGINT" "BIGSERIAL" "BIT" "BLOB" "BOOL" "BOOLEAN" "BYTEA"
    "CHAR" "CHARACTER" "DATE" "DATETIME" "DECIMAL" "DOUBLE" "FLOAT" "INT"
    "INTEGER" "INTERVAL" "JSON" "JSONB" "NCHAR" "NUMERIC" "NVARCHAR" "REAL"
    "SERIAL" "SMALLINT" "TEXT" "TIME" "TIMESTAMP" "TIMESTAMPTZ" "TINYINT"
    "UUID" "VARBINARY" "VARCHAR" "XML"))

(function_parameter
  name: (identifier) @variable.parameter)

(named_argument
  name: (identifier) @variable.parameter)

(parameter) @variable.parameter

; Functions
; ---------

(function_call
  name: (object_reference
    name: (identifier) @function.call))

(create_function_statement
  name: (object_reference
    name: (identifier) @function))

(create_trigger_statement
  name: (object_reference
    name: (identifier) @function))

(trigger_event
  (identifier) @property)

((identifier) @function.builtin
  (#any-of? @function.builtin
    "current_date" "current_time" "current_timestamp" "current_user"
    "current_role" "current_catalog" "current_schema" "session_user"
    "localtime" "localtimestamp" "CURRENT_DATE" "CURRENT_TIME"
    "CURRENT_TIMESTAMP" "CURRENT_USER" "CURRENT_ROLE" "CURRENT_CATALOG"
    "CURRENT_SCHEMA" "SESSION_USER" "LOCALTIME" "LOCALTIMESTAMP"))

; Literals
; --------

(comment) @comment

[
  (string)
  (dollar_quoted_string)
] @string

(copy_data) @string.special

(number) @number

; Shell commands
; --------------

[
  (meta_command)
  (dot_command)
] @keyword.directive

; Operators and punctuation
; -------------------------

; \`*\` is multiplication only in a binary expression; in \`count(*)\` and \`t.*\`
; it is \`all_columns\`.
(binary_expression
  operator: "*" @operator)

[
  "=" "<" ">" "<=" ">=" "<>" "!=" "==" "<=>" "+" "-" "/" "%" "^" "||"
  "~" "&&" "::" ":=" "=>"
  (operator)
] @operator

[
  "(" ")" "[" "]"
] @punctuation.bracket

[
  "," "." ";" ":"
] @punctuation.delimiter

[
  "AND" "OR" "NOT" "XOR" "IN" "IS" "LIKE" "ILIKE" "GLOB" "REGEXP" "RLIKE"
  "MATCH" "SIMILAR" "BETWEEN" "SYMMETRIC" "ASYMMETRIC" "ESCAPE" "ISNULL"
  "NOTNULL" "EXISTS" "ANY" "SOME" "DIV" "MOD" "OVERLAPS"
] @keyword.operator

[
  "CASE" "WHEN" "THEN" "ELSE"
] @keyword.conditional

[
  "FUNCTION" "PROCEDURE" "RETURNS" "RETURN"
] @keyword.function

[
  "WITH TIME ZONE" "WITHOUT TIME ZONE" "%TYPE" "%ROWTYPE"
] @keyword.type

; keywords: begin
[
  "ABORT" "ADD" "AFTER" "ALL" "ALTER" "ARRAY" "AS" "ASC" "AT" "ATOMIC"
  "ATTACH" "AUTHORIZATION" "BEGIN" "BOTH" "BY" "CALL" "CASCADE" "CAST"
  "CHARACTER" "CHECK" "COLLATE" "COLLATION" "COLUMN" "COMMENT" "COMMIT"
  "CONCURRENTLY" "CONFLICT" "CONSTRAINT" "COPY" "CREATE" "CROSS" "CURRENT"
  "CYCLE" "DATA" "DATABASE" "DECLARE" "DEFAULT" "DEFERRABLE" "DELETE" "DESC"
  "DISTINCT" "DO" "DROP" "DUPLICATE" "END" "EXCEPT" "EXCLUDE" "EXECUTE"
  "EXPLAIN" "FAIL" "FALSE" "FETCH" "FILTER" "FIRST" "FOLLOWING" "FOR" "FORCE"
  "FOREIGN" "FROM" "FULL" "FULLTEXT" "GENERATED" "GLOBAL" "GROUP" "GROUPING"
  "GROUPS" "HAVING" "IF" "IGNORE" "INCLUDE" "INDEX" "INDEXED" "INHERITS"
  "INITIALLY" "INNER" "INOUT" "INSERT" "INTERSECT" "INTO" "JOIN" "JSON" "KEY"
  "KEYS" "LANGUAGE" "LAST" "LATERAL" "LEADING" "LEFT" "LIMIT" "LOCAL" "LOCKED"
  "MATERIALIZED" "MERGE" "MINUS" "NATURAL" "NEXT" "NO" "NOTHING" "NOWAIT"
  "NULL" "NULLS" "OBJECT" "OF" "OFF" "OFFSET" "ON" "ONLY" "OPERATOR" "OPTION"
  "OPTIONS" "ORDER" "ORDINALITY" "OTHERS" "OUT" "OUTER" "OVER" "OVERRIDING"
  "PARTITION" "PERIOD" "PLACING" "PRAGMA" "PRECEDING" "PRECISION" "PREPARE"
  "PRIMARY" "QUALIFY" "RANGE" "RECURSIVE" "REFERENCES" "REFERENCING" "RENAME"
  "REPEATABLE" "REPLACE" "RESPECT" "RESTRICT" "RETURNING" "RIGHT" "ROLLBACK"
  "ROLLUP" "ROW" "ROWS" "SCALAR" "SCHEMA" "SEARCH" "SELECT" "SERVER" "SESSION"
  "SET" "SETOF" "SETS" "SHARE" "SKIP" "SPATIAL" "STDIN" "STRAIGHT_JOIN"
  "STRICT" "SYSTEM" "TABLE" "TABLESAMPLE" "TABLESPACE" "TEMP" "TEMPORARY"
  "TIES" "TIME" "TO" "TRAILING" "TRIGGER" "TRUE" "TRUNCATE" "TYPE" "UESCAPE"
  "UNBOUNDED" "UNION" "UNIQUE" "UNLOGGED" "UPDATE" "USE" "USER" "USING"
  "VALUE" "VALUES" "VARIADIC" "VARYING" "VIEW" "VIRTUAL" "WHERE" "WINDOW"
  "WITH" "WITHIN" "WITHOUT" "ZONE"
] @keyword

; keywords: end

; Overrides
; ---------

; \`END\` closes a CASE as well as a block or a transaction.
(case_expression
  "END" @keyword.conditional)

; Literals that are single keywords.
(boolean) @boolean

(null) @constant.builtin

(all_columns) @character.special
`,injections:`; Injections for SQL: the bodies of functions and DO blocks written in SQL,
; PL/pgSQL or PL/Python.
;
; PL/pgSQL is not SQL, but its statements are, so highlighting it as SQL
; marks most of it correctly. LANGUAGE can come before or after the body.

; CREATE FUNCTION ... AS $$ ... $$ LANGUAGE sql
(create_function_statement
  body: (dollar_quoted_string
    (string_content) @injection.content)
  language: (identifier) @_language
  (#match? @_language "^[\\"]?([sS][qQ][lL]|[pP][lL][pP][gG][sS][qQ][lL])[\\"]?$")
  (#set! injection.language "sql"))

(create_function_statement
  language: (identifier) @_language
  body: (dollar_quoted_string
    (string_content) @injection.content)
  (#match? @_language "^[\\"]?([sS][qQ][lL]|[pP][lL][pP][gG][sS][qQ][lL])[\\"]?$")
  (#set! injection.language "sql"))

(create_function_statement
  body: (dollar_quoted_string
    (string_content) @injection.content)
  language: (identifier) @_language
  (#match? @_language "^[\\"]?[pP][lL][pP][yY][tT][hH][oO][nN]3?[uU]?[\\"]?$")
  (#set! injection.language "python"))

(create_function_statement
  language: (identifier) @_language
  body: (dollar_quoted_string
    (string_content) @injection.content)
  (#match? @_language "^[\\"]?[pP][lL][pP][yY][tT][hH][oO][nN]3?[uU]?[\\"]?$")
  (#set! injection.language "python"))

; DO $$ ... $$, whose language is PL/pgSQL unless it says otherwise.
(do_statement
  !language
  body: (dollar_quoted_string
    (string_content) @injection.content)
  (#set! injection.language "sql"))

(do_statement
  language: (identifier) @_language
  body: (dollar_quoted_string
    (string_content) @injection.content)
  (#match? @_language "^[\\"]?([sS][qQ][lL]|[pP][lL][pP][gG][sS][qQ][lL])[\\"]?$")
  (#set! injection.language "sql"))

(do_statement
  body: (dollar_quoted_string
    (string_content) @injection.content)
  language: (identifier) @_language
  (#match? @_language "^[\\"]?([sS][qQ][lL]|[pP][lL][pP][gG][sS][qQ][lL])[\\"]?$")
  (#set! injection.language "sql"))
`,tags:`(create_table_statement
  name: (object_reference
    name: (identifier) @name)) @definition.class

(create_view_statement
  name: (object_reference
    name: (identifier) @name)) @definition.class

(create_type_statement
  name: (object_reference
    name: (identifier) @name)) @definition.type

(create_function_statement
  name: (object_reference
    name: (identifier) @name)) @definition.function

(create_trigger_statement
  name: (object_reference
    name: (identifier) @name)) @definition.function

(create_index_statement
  name: (object_reference
    name: (identifier) @name)) @definition.constant

(cte
  name: (identifier) @name) @definition.class

(function_call
  name: (object_reference
    name: (identifier) @name)) @reference.call

(table_reference
  name: (object_reference
    name: (identifier) @name)) @reference.class
`,folds:`[
  (select_statement)
  (insert_statement)
  (update_statement)
  (delete_statement)
  (merge_statement)
  (create_table_statement)
  (create_view_statement)
  (create_function_statement)
  (create_trigger_statement)
  (create_statement)
  (alter_table_statement)
  (table_elements)
  (cte)
  (subquery)
  (parenthesized_query)
  (case_expression)
  (atomic_block)
  (token_group)
  (dollar_quoted_string)
  (copy_data)
  (comment)
] @fold
`}},swift:{wasm:"tree-sitter-swift.wasm",title:"Swift",scope:"source.swift",fileTypes:["swift"],injectionRegex:"^swift$",queries:{highlights:`; Highlights for Swift.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Types
; -----

(type_identifier) @type

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "Int" "Int8" "Int16" "Int32" "Int64" "Int128" "UInt" "UInt8" "UInt16"
    "UInt32" "UInt64" "UInt128" "Float" "Float16" "Float80" "Double" "Bool"
    "String" "Character" "Substring" "Void" "Never" "Any" "AnyObject"
    "Optional" "Array" "Dictionary" "Set"))

((type_identifier) @type.builtin
  (#eq? @type.builtin "Self"))

((identifier) @type.builtin
  (#eq? @type.builtin "Self"))

; Capitalized names in expressions are usually types: \`String(x)\`, \`Foo.bar\`.
((identifier) @type
  (#match? @type "^[A-Z]"))

(metatype_type
  kind: _ @keyword.type)

; Comments
; --------

(comment) @comment
(multiline_comment) @comment

((comment) @comment.documentation
  (#match? @comment.documentation "^///"))

((multiline_comment) @comment.documentation
  (#match? @comment.documentation "^/\\\\*\\\\*"))

(shebang) @keyword.directive

; Literals
; --------

[
  (string_literal)
  (multiline_string_literal)
  (raw_string_literal)
] @string

(regex_literal) @string.regexp

(escape_sequence) @string.escape

(integer_literal) @number
(float_literal) @number.float
(version) @number.float
(boolean_literal) @boolean
(nil_literal) @constant.builtin

; Variables and parameters
; ------------------------

(self_expression) @variable.builtin
(super_expression) @variable.builtin

((identifier) @variable.builtin
  (#match? @variable.builtin "^\\\\$[0-9]+$"))

(parameter
  name: (identifier) @variable.parameter)

(closure_parameter
  name: (identifier) @variable.parameter)

; Argument labels, parameter external names and tuple labels.
(argument
  label: (identifier) @label)

(tuple_element
  label: (identifier) @label)

(tuple_pattern_element
  label: (identifier) @label)

(parameter
  external_name: (identifier) @label)

(closure_parameter
  external_name: (identifier) @label)

(enum_case_parameter
  external_name: (identifier) @label)

(enum_case_parameter
  name: (identifier) @variable.parameter)

(tuple_type_element
  name: (identifier) @variable.parameter)

(argument_names
  name: (identifier) @label)

(labeled_trailing_closure
  label: (identifier) @label)

(labeled_statement
  label: (identifier) @label)

(break_statement
  label: (identifier) @label)

(continue_statement
  label: (identifier) @label)

(attribute_argument
  label: (identifier) @label)

; Properties
; ----------

(member_expression
  name: (identifier) @property)

(implicit_member_expression
  name: (identifier) @constant)

(pattern_binding
  pattern: (identifier) @variable)

(member_block
  (variable_declaration
    binding: (pattern_binding
      pattern: (identifier) @property)))

(key_path_expression
  member: (identifier) @property)

(enum_case_element
  name: (identifier) @constant)

(enum_case_pattern
  name: (identifier) @constant)

; Functions
; ---------

(function_declaration
  name: (identifier) @function)

(function_declaration
  name: (operator) @operator)

(macro_declaration
  name: (identifier) @function.macro)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (member_expression
    name: (identifier) @function.method.call))

(call_expression
  function: (specialize_expression
    expression: (identifier) @function.call))

(function_reference
  function: (identifier) @function.call)

(function_reference
  function: (member_expression
    name: (identifier) @function.method.call))

; \`String(x)\`, \`Foo.Bar(x)\`: initializer calls.
((call_expression
  function: (identifier) @constructor)
  (#match? @constructor "^[A-Z]"))

((call_expression
  function: (member_expression
    name: (identifier) @constructor))
  (#match? @constructor "^[A-Z]"))

; \`.init(...)\`, \`super.init()\`, \`Foo.init\`
((member_expression
  name: (identifier) @constructor)
  (#eq? @constructor "init"))

((implicit_member_expression
  name: (identifier) @constructor)
  (#eq? @constructor "init"))

((member_expression
  name: (identifier) @variable.builtin)
  (#eq? @variable.builtin "self"))

(macro_expansion) @function.macro

(macro_expansion_declaration
  macro: (macro_expansion) @function.macro)

; Attributes
; ----------

(attribute
  "@" @attribute
  name: (_) @attribute)

(attribute
  name: (member_type
    (type_identifier) @attribute))

(attribute
  name: (generic_type
    name: (type_identifier) @attribute))

; Declarations of types
; ---------------------

(typealias_declaration
  name: (type_identifier) @type.definition)

(associatedtype_declaration
  name: (type_identifier) @type.definition)

(precedence_group_declaration
  name: (identifier) @type)

(precedence_group_attribute
  name: (identifier) @property)

(precedence_group_attribute
  value: (identifier) @constant)

(operator_declaration
  precedence_group: (identifier) @type)

(import_path
  (identifier) @module)

; Keywords
; --------

[
  "import"
  "typealias"
  "associatedtype"
  "operator"
  "precedencegroup"
  "let"
  "var"
  "subscript"
  "macro"
  "where"
  "in"
  "defer"
  "fallthrough"
] @keyword

[
  "struct"
  "class"
  "actor"
  "enum"
  "protocol"
  "extension"
  "some"
  "any"
] @keyword.type

[
  "func"
] @keyword.function

[
  "init"
  "deinit"
] @constructor

[
  "as"
  "is"
] @keyword.operator

[
  "return"
] @keyword.return

[
  "if"
  "else"
  "guard"
  "switch"
  "case"
  "default"
] @keyword.conditional

[
  "for"
  "while"
  "repeat"
  "break"
  "continue"
] @keyword.repeat

[
  "throw"
  "throws"
  "rethrows"
  "try"
  "catch"
  "do"
] @keyword.exception

[
  "async"
  "await"
] @keyword.coroutine

; \`repeat each x\` is a pack expansion, not a loop.
(pack_expansion_expression
  "repeat" @keyword)

(pack_expansion_type
  "repeat" @keyword)

[
  "each"
  "consume"
  "copy"
  "unsafe"
] @keyword

(modifier) @keyword.modifier
(type_specifier) @keyword.modifier

(capture_item
  specifier: _ @keyword.modifier)

(accessor
  [
    "get"
    "set"
    "willSet"
    "didSet"
    "_read"
    "_modify"
    "unsafeAddress"
    "unsafeMutableAddress"
    "borrow"
    "mutate"
    "mutating"
    "nonmutating"
    "__consuming"
    "borrowing"
    "consuming"
  ] @keyword)

(import_declaration
  kind: _ @keyword.type)

(generic_parameter
  [
    "each"
    "let"
  ] @keyword)

[
  "#if"
  "#elseif"
  "#else"
  "#endif"
] @keyword.directive

[
  "#available"
  "#unavailable"
] @keyword

(wildcard) @variable.builtin

; Operators
; ---------

[
  "!" "!=" "!==" "%" "%=" "&" "&&" "&*" "&*=" "&+" "&+=" "&-" "&-=" "&<<"
  "&<<=" "&=" "&>>" "&>>=" "*" "*=" "+" "+=" "-" "-=" "->" "..." "..<" "/"
  "/=" "<" "<<" "<<=" "<=" "=" "==" "===" ">" ">=" ">>" ">>=" "?" "??" "^"
  "^=" "|" "|=" "||" "~" "~=" ".==" ".!=" ".<" ".<=" ".>" ".>="
] @operator

(custom_operator) @operator
(operator) @operator

(key_path_expression
  "\\\\" @operator)

; Punctuation
; -----------

[
  "(" ")" "[" "]" "{" "}"
] @punctuation.bracket

[
  ";" "," "." ":"
] @punctuation.delimiter

; Generic angle brackets are brackets, not comparisons.
(type_arguments
  [
    "<"
    ">"
  ] @punctuation.bracket)

(generic_parameter_clause
  [
    "<"
    ">"
  ] @punctuation.bracket)

(primary_associated_types
  [
    "<"
    ">"
  ] @punctuation.bracket)

; Interpolation delimiters, \`\\(\` and \`)\`.
(interpolation
  "\\\\(" @punctuation.special
  ")" @punctuation.special)
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

((multiline_comment) @injection.content
  (#set! injection.language "comment"))

((regex_literal) @injection.content
  (#set! injection.language "regex"))
`,locals:`; Scopes
; ------

[
  (source_file)
  (block)
  (closure_expression)
  (function_declaration)
  (initializer_declaration)
  (subscript_declaration)
  (accessor)
  (member_block)
  (if_statement)
  (guard_statement)
  (for_statement)
  (while_statement)
  (switch_case)
  (catch_clause)
] @local.scope

; Definitions
; -----------

(pattern_binding
  pattern: (identifier) @local.definition.var)

(pattern_binding
  pattern: (tuple_pattern
    element: (identifier) @local.definition.var))

(optional_binding_condition
  pattern: (identifier) @local.definition.var)

(value_binding_pattern
  pattern: (identifier) @local.definition.var)

(for_statement
  pattern: (identifier) @local.definition.var)

(function_declaration
  name: (identifier) @local.definition.function)

(parameter
  name: (identifier) @local.definition.parameter)

(closure_parameter
  name: (identifier) @local.definition.parameter)

(generic_parameter
  name: (type_identifier) @local.definition.type)

; References
; ----------

(identifier) @local.reference
`,tags:`(class_declaration
  name: (type_identifier) @name) @definition.class

(struct_declaration
  name: (type_identifier) @name) @definition.class

(actor_declaration
  name: (type_identifier) @name) @definition.class

(enum_declaration
  name: (type_identifier) @name) @definition.enum

(protocol_declaration
  name: (type_identifier) @name) @definition.interface

(extension_declaration
  type: (_) @name) @definition.class

(typealias_declaration
  name: (type_identifier) @name) @definition.type

(associatedtype_declaration
  name: (type_identifier) @name) @definition.type

(function_declaration
  name: (_) @name) @definition.function

(macro_declaration
  name: (identifier) @name) @definition.macro

(member_block
  (function_declaration
    name: (_) @name) @definition.method)

(enum_case_element
  name: (identifier) @name) @definition.constant

(member_block
  (variable_declaration
    binding: (pattern_binding
      pattern: (identifier) @name)) @definition.field)

(call_expression
  function: [
    (identifier) @name
    (member_expression
      name: (identifier) @name)
  ]) @reference.call
`,folds:`[
  (block)
  (member_block)
  (accessor_block)
  (closure_expression)
  (switch_statement)
  (switch_case)
  (if_config)
  (argument_list)
  (parameter_clause)
  (array_literal)
  (dictionary_literal)
  (multiline_string_literal)
  (multiline_comment)
  (import_declaration)
] @fold
`}},typescript:{wasm:"tree-sitter-typescript.wasm",title:"TypeScript",scope:"source.ts",fileTypes:["ts","mts","cts","tsx"],injectionRegex:"^(ts|tsx|typescript)$",queries:{highlights:`; Highlights for TypeScript and JSX.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Keywords come before names:
; a contextual keyword used as a name (\`x.type\`, \`{ get: 1 }\`) is a name node
; with the keyword token inside it, at the same position, and the name wins.

; Punctuation
; -----------

[
  ";"
  "."
  ","
  ":"
] @punctuation.delimiter

(optional_chain) @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(type_arguments
  [
    "<"
    ">"
  ] @punctuation.bracket)

(type_parameters
  [
    "<"
    ">"
  ] @punctuation.bracket)

(template_substitution
  [
    "\${"
    "}"
  ] @punctuation.special)

(template_type
  [
    "\${"
    "}"
  ] @punctuation.special)

; Operators
; ---------

[
  "-"
  "--"
  "-="
  "+"
  "++"
  "+="
  "*"
  "*="
  "**"
  "**="
  "/="
  "%"
  "%="
  "<"
  "<="
  "<<"
  "<<="
  "="
  "=="
  "==="
  "!"
  "!="
  "!=="
  "=>"
  ">"
  ">="
  ">>"
  ">>="
  ">>>"
  ">>>="
  "~"
  "^"
  "&"
  "|"
  "^="
  "&="
  "|="
  "&&"
  "||"
  "??"
  "&&="
  "||="
  "??="
  "..."
  "?"
  "-?:"
  "+?:"
  "?:"
] @operator

; \`/\` is also a regex delimiter.
(binary_expression
  operator: "/" @operator)

(ternary_expression
  [
    "?"
    ":"
  ] @keyword.conditional.ternary)

(conditional_type
  [
    "?"
    ":"
  ] @keyword.conditional.ternary)

; Keywords
; --------

[
  "as"
  "async"
  "await"
  "class"
  "const"
  "debugger"
  "declare"
  "delete"
  "extends"
  "get"
  "implements"
  "in"
  "infer"
  "instanceof"
  "is"
  "keyof"
  "let"
  "new"
  "of"
  "satisfies"
  "set"
  "typeof"
  "unique"
  "var"
  "void"
  "with"
  "using"
  "asserts"
  "out"
  "accessor"
  "target"
  "meta"
] @keyword

[
  "enum"
  "interface"
  "type"
  "namespace"
  "module"
  "global"
] @keyword.type

[
  "abstract"
  "private"
  "protected"
  "public"
  "readonly"
  "static"
  "override"
] @keyword.modifier

(override_modifier) @keyword.modifier

[
  "function"
] @keyword.function

[
  "return"
  "yield"
] @keyword.return

[
  "if"
  "else"
  "switch"
  "case"
  "default"
] @keyword.conditional

[
  "for"
  "while"
  "do"
  "break"
  "continue"
] @keyword.repeat

[
  "try"
  "catch"
  "finally"
  "throw"
] @keyword.exception

[
  "import"
  "export"
  "from"
  "require"
  "defer"
  "source"
  "assert"
] @keyword.import

(import) @keyword.import

; Names
; -----

(identifier) @variable

; Names by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z]"))

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((shorthand_property_identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((identifier) @variable.builtin
  (#any-of? @variable.builtin
    "arguments" "module" "console" "window" "document" "globalThis"
    "require" "exports"))

((identifier) @function.builtin
  (#eq? @function.builtin "require"))

[
  (this)
  (super)
] @variable.builtin

; Properties
; ----------

(property_identifier) @property

(private_property_identifier) @property

(shorthand_property_identifier) @property

(shorthand_property_identifier_pattern) @variable

; Parameters
; ----------

(required_parameter
  pattern: (identifier) @variable.parameter)

(optional_parameter
  pattern: (identifier) @variable.parameter)

(required_parameter
  pattern: (rest_pattern
    (identifier) @variable.parameter))

(required_parameter
  pattern: (object_pattern
    (shorthand_property_identifier_pattern) @variable.parameter))

(required_parameter
  pattern: (object_pattern
    (pair_pattern
      value: (identifier) @variable.parameter)))

(required_parameter
  pattern: (array_pattern
    (identifier) @variable.parameter))

(arrow_function
  parameter: (identifier) @variable.parameter)

(catch_clause
  parameter: (identifier) @variable.parameter)

; Functions
; ---------

(function_declaration
  name: (identifier) @function)

(function_expression
  name: (identifier) @function)

(generator_function_declaration
  name: (identifier) @function)

(generator_function
  name: (identifier) @function)

(function_signature
  name: (identifier) @function)

(method_definition
  name: (property_identifier) @function.method)

(method_definition
  name: (private_property_identifier) @function.method)

(method_signature
  name: (property_identifier) @function.method)

((method_definition
  name: (property_identifier) @constructor)
  (#eq? @constructor "constructor"))

(pair
  key: (property_identifier) @function.method
  value: [
    (function_expression)
    (arrow_function)
  ])

(variable_declarator
  name: (identifier) @function
  value: [
    (function_expression)
    (arrow_function)
  ])

(assignment_expression
  left: (member_expression
    property: (property_identifier) @function.method)
  right: [
    (function_expression)
    (arrow_function)
  ])

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (member_expression
    property: [
      (property_identifier)
      (private_property_identifier)
    ] @function.method.call))

(new_expression
  constructor: (identifier) @constructor)

(new_expression
  constructor: (member_expression
    property: (property_identifier) @constructor))

(decorator
  "@" @attribute
  (identifier) @attribute)

(decorator
  (call_expression
    function: (identifier) @attribute))

(decorator
  (member_expression
    property: (property_identifier) @attribute))

(decorator
  (call_expression
    function: (member_expression
      property: (property_identifier) @attribute)))

; Types
; -----

(type_identifier) @type

(predefined_type) @type.builtin

(this_type) @variable.builtin

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "Array" "ReadonlyArray" "Promise" "Record" "Partial" "Required"
    "Readonly" "Pick" "Omit" "Exclude" "Extract" "NonNullable" "ReturnType"
    "Parameters" "InstanceType" "Awaited" "Map" "Set" "WeakMap" "WeakSet"))

(nested_type_identifier
  module: (identifier) @module)

(internal_module
  name: (identifier) @module)

(internal_module
  name: (nested_identifier
    (identifier) @module))

(module
  name: (identifier) @module)

(import_alias
  name: (identifier) @module)

(namespace_import
  (identifier) @module)

(type_predicate
  name: (identifier) @variable.parameter)

(asserts
  (identifier) @variable.parameter)

(enum_declaration
  name: (identifier) @type)

(enum_body
  name: (property_identifier) @constant)

(enum_assignment
  name: (property_identifier) @constant)

(class
  name: (type_identifier) @type)

; Labels
; ------

(statement_identifier) @label

; Literals
; --------

[
  (string)
  (template_string)
  (template_literal_type)
] @string

(escape_sequence) @string.escape

(regex) @string.regexp

(regex_flags) @character.special

(number) @number

[
  (true)
  (false)
] @boolean

[
  (null)
  (undefined)
] @constant.builtin

[
  (comment)
  (html_comment)
  (hash_bang_line)
] @comment

((comment) @comment.documentation
  (#match? @comment.documentation "^/[*][*][^*].*[*]/$"))

; JSX
; ---

(jsx_opening_element
  name: (identifier) @tag)

(jsx_closing_element
  name: (identifier) @tag)

(jsx_self_closing_element
  name: (identifier) @tag)

; Capitalized names are components.
(jsx_opening_element
  name: (identifier) @type
  (#match? @type "^[A-Z]"))

(jsx_closing_element
  name: (identifier) @type
  (#match? @type "^[A-Z]"))

(jsx_self_closing_element
  name: (identifier) @type
  (#match? @type "^[A-Z]"))

(jsx_opening_element
  name: (member_expression
    property: (property_identifier) @type))

(jsx_closing_element
  name: (member_expression
    property: (property_identifier) @type))

(jsx_self_closing_element
  name: (member_expression
    property: (property_identifier) @type))

(jsx_namespace_name
  (identifier) @tag)

(jsx_attribute
  (property_identifier) @tag.attribute)

(jsx_attribute
  (jsx_namespace_name
    (identifier) @tag.attribute))

(html_character_reference) @string.special

(jsx_opening_element
  [
    "<"
    ">"
  ] @tag.delimiter)

(jsx_closing_element
  [
    "<"
    "/"
    ">"
  ] @tag.delimiter)

(jsx_self_closing_element
  [
    "<"
    "/"
    ">"
  ] @tag.delimiter)

(jsx_expression
  [
    "{"
    "}"
  ] @punctuation.special)
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

((regex_pattern) @injection.content
  (#set! injection.language "regex"))

; Tagged templates: html\`...\`, css\`...\`, sql\`...\`, graphql\`...\`
(call_expression
  function: (identifier) @injection.language
  arguments: (template_string) @injection.content
  (#any-of? @injection.language "html" "css" "sql" "graphql")
  (#set! injection.include-children))

(call_expression
  function: (identifier) @_name
  arguments: (template_string) @injection.content
  (#eq? @_name "gql")
  (#set! injection.language "graphql")
  (#set! injection.include-children))
`,locals:`; Scopes
; ------

[
  (program)
  (statement_block)
  (function_declaration)
  (function_expression)
  (generator_function_declaration)
  (generator_function)
  (arrow_function)
  (method_definition)
  (class_body)
  (for_statement)
  (for_in_statement)
  (catch_clause)
  (switch_body)
] @local.scope

; Definitions
; -----------

(variable_declarator
  name: (identifier) @local.definition.var)

(variable_declarator
  name: (object_pattern
    (shorthand_property_identifier_pattern) @local.definition.var))

(variable_declarator
  name: (object_pattern
    (pair_pattern
      value: (identifier) @local.definition.var)))

(variable_declarator
  name: (array_pattern
    (identifier) @local.definition.var))

(for_in_statement
  left: (identifier) @local.definition.var)

(required_parameter
  pattern: (identifier) @local.definition.parameter)

(optional_parameter
  pattern: (identifier) @local.definition.parameter)

(required_parameter
  pattern: (rest_pattern
    (identifier) @local.definition.parameter))

(required_parameter
  pattern: (object_pattern
    (shorthand_property_identifier_pattern) @local.definition.parameter))

(arrow_function
  parameter: (identifier) @local.definition.parameter)

(catch_clause
  parameter: (identifier) @local.definition.parameter)

(function_declaration
  name: (identifier) @local.definition.function)

(generator_function_declaration
  name: (identifier) @local.definition.function)

(class_declaration
  name: (type_identifier) @local.definition.type)

(interface_declaration
  name: (type_identifier) @local.definition.type)

(type_alias_declaration
  name: (type_identifier) @local.definition.type)

(enum_declaration
  name: (identifier) @local.definition.type)

(type_parameter
  name: (type_identifier) @local.definition.type)

(import_clause
  (identifier) @local.definition.import)

(import_specifier
  alias: (identifier) @local.definition.import)

(import_specifier
  !alias
  name: (identifier) @local.definition.import)

(namespace_import
  (identifier) @local.definition.import)

; References
; ----------

(identifier) @local.reference

(type_identifier) @local.reference

(shorthand_property_identifier) @local.reference
`,tags:`(function_declaration
  name: (identifier) @name) @definition.function

(generator_function_declaration
  name: (identifier) @name) @definition.function

(function_signature
  name: (identifier) @name) @definition.function

(variable_declarator
  name: (identifier) @name
  value: [
    (arrow_function)
    (function_expression)
  ]) @definition.function

(method_definition
  name: (property_identifier) @name) @definition.method

(method_signature
  name: (property_identifier) @name) @definition.method

(class_declaration
  name: (type_identifier) @name) @definition.class

(abstract_class_declaration
  name: (type_identifier) @name) @definition.class

(interface_declaration
  name: (type_identifier) @name) @definition.interface

(type_alias_declaration
  name: (type_identifier) @name) @definition.type

(enum_declaration
  name: (identifier) @name) @definition.enum

(internal_module
  name: (identifier) @name) @definition.module

(module
  name: (identifier) @name) @definition.module

(call_expression
  function: (identifier) @name) @reference.call

(call_expression
  function: (member_expression
    property: (property_identifier) @name)) @reference.call

(new_expression
  constructor: (identifier) @name) @reference.class

(implements_clause
  (type_identifier) @name) @reference.implementation

(extends_type_clause
  type: (type_identifier) @name) @reference.interface
`,folds:`[
  (statement_block)
  (class_body)
  (object_type)
  (interface_body)
  (enum_body)
  (switch_body)
  (switch_case)
  (object)
  (object_pattern)
  (array)
  (arguments)
  (formal_parameters)
  (named_imports)
  (export_clause)
  (template_string)
  (comment)
] @fold
`}},verilog:{wasm:"tree-sitter-verilog.wasm",title:"Verilog",scope:"source.verilog",fileTypes:["v","vh"],injectionRegex:"^(verilog|v)$",queries:{highlights:`; Highlights for Verilog.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

(escaped_identifier) @variable

; Constants by convention
; -----------------------

((identifier) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]*$"))

; Comments and directives
; -----------------------

(comment) @comment

[
  "\`define"
  "\`undef"
  "\`ifdef"
  "\`ifndef"
  "\`elsif"
  "\`include"
  "\`timescale"
  (else_directive)
  (endif_directive)
  (directive)
] @keyword.directive

(define_directive
  name: (_) @constant.macro)

(macro_parameter
  name: (_) @variable.parameter)

(macro_text) @string.special

[
  (undef_directive
    name: (_) @constant.macro)
  (ifdef_directive
    name: (_) @constant.macro)
  (elsif_directive
    name: (_) @constant.macro)
]

(include_directive
  path: (_) @string.special.path)

(time_literal) @number

(macro_identifier) @constant.macro

; Literals
; --------

(number) @number

(real_number) @number.float

(string) @string

(escape_sequence) @string.escape

[
  (level_symbol)
  (edge_symbol)
  (no_change)
  (edge_descriptor)
] @constant

; Declarations
; ------------

(module_declaration
  name: (_) @type.definition)

(udp_declaration
  name: (_) @type.definition)

(config_declaration
  name: (_) @type.definition)

(module_instantiation
  type: (_) @type)

(instance
  name: (_) @variable.member)

(port_declaration
  name: (_) @variable.parameter)

(port_declaration
  declarator: [
    (identifier)
    (escaped_identifier)
  ] @variable.parameter)

(port_declaration
  declarator: (declarator
    name: (_) @variable.parameter))

(port
  name: (_) @variable.parameter)

(named_port_connection
  name: (_) @property)

(named_parameter_assignment
  name: (_) @property)

(parameter_assignment
  name: (_) @constant)

(specparam_assignment
  name: (_) @constant)

(function_declaration
  name: (_) @function)

(task_declaration
  name: (_) @function)

(function_call
  function: [
    (identifier)
    (escaped_identifier)
  ] @function.call)

(function_call
  function: (hierarchical_identifier
    name: (_) @function.call))

(task_enable
  name: [
    (identifier)
    (escaped_identifier)
  ] @function.call)

(task_enable
  name: (hierarchical_identifier
    name: (_) @function.call))

(system_identifier) @function.builtin

[
  (seq_block
    name: (_) @label)
  (par_block
    name: (_) @label)
  (generate_block
    name: (_) @label)
]

(disable_statement
  name: (_) @label)

(attribute_spec
  name: (_) @attribute)

(cell_reference
  library: (_) @module)

; Keywords
; --------

[
  "module"
  "macromodule"
  "endmodule"
  "primitive"
  "endprimitive"
  "table"
  "endtable"
  "config"
  "endconfig"
  "design"
  "instance"
  "cell"
  "liblist"
  "use"
  "specify"
  "endspecify"
  "generate"
  "endgenerate"
  "begin"
  "end"
  "fork"
  "join"
  "initial"
  "always"
  "assign"
  "deassign"
  "force"
  "release"
  "defparam"
  "disable"
  "wait"
  "pulsestyle_onevent"
  "pulsestyle_ondetect"
  "showcancelled"
  "noshowcancelled"
  "edge"
] @keyword

[
  "function"
  "endfunction"
  "task"
  "endtask"
] @keyword.function

[
  "input"
  "output"
  "inout"
  "parameter"
  "localparam"
  "specparam"
  "automatic"
  "signed"
  "vectored"
  "scalared"
] @keyword.modifier

[
  "if"
  "else"
  "case"
  "casez"
  "casex"
  "endcase"
  "default"
  "ifnone"
] @keyword.conditional

[
  "for"
  "while"
  "repeat"
  "forever"
] @keyword.repeat

[
  "posedge"
  "negedge"
  "or"
] @keyword.operator

[
  "wire"
  "tri"
  "tri0"
  "tri1"
  "triand"
  "trior"
  "trireg"
  "wand"
  "wor"
  "uwire"
  "supply0"
  "supply1"
  "reg"
  "integer"
  "real"
  "realtime"
  "time"
  "event"
  "genvar"
] @type.builtin

; Gates
(gate_instantiation
  type: _ @function.builtin)

; Drive and charge strengths
(strength
  [
    "strong0"
    "strong1"
    "pull0"
    "pull1"
    "weak0"
    "weak1"
    "highz0"
    "highz1"
    "supply0"
    "supply1"
    "small"
    "medium"
    "large"
  ] @constant.builtin)

; Operators and punctuation
; -------------------------

[
  "="
  "<="
  "+"
  "-"
  "*"
  "/"
  "%"
  "**"
  "!"
  "~"
  "&"
  "~&"
  "|"
  "~|"
  "^"
  "~^"
  "^~"
  "&&"
  "||"
  "=="
  "!="
  "==="
  "!=="
  "<"
  ">"
  ">="
  "<<"
  ">>"
  "<<<"
  ">>>"
  "?"
  "->"
  "=>"
  "*>"
  "+=>"
  "-=>"
  "+*>"
  "-*>"
  "&&&"
  "+:"
  "-:"
] @operator

(conditional_expression
  ":" @operator)

[
  "#"
  "@"
] @punctuation.special

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "(*"
  "*)"
] @punctuation.bracket

[
  ";"
  ","
  "."
  ":"
] @punctuation.delimiter
`,tags:`(module_declaration
  name: (_) @name) @definition.module

(udp_declaration
  name: (_) @name) @definition.module

(function_declaration
  name: (_) @name) @definition.function

(task_declaration
  name: (_) @name) @definition.function

(define_directive
  name: (_) @name) @definition.macro

(module_instantiation
  type: (_) @name) @reference.class

(function_call
  function: [
    (identifier) @name
    (escaped_identifier) @name
    (hierarchical_identifier
      name: (_) @name)
  ]) @reference.call

(task_enable
  name: [
    (identifier) @name
    (escaped_identifier) @name
    (hierarchical_identifier
      name: (_) @name)
  ]) @reference.call
`,folds:`[
  (module_declaration)
  (udp_declaration)
  (config_declaration)
  (function_declaration)
  (task_declaration)
  (seq_block)
  (par_block)
  (generate_region)
  (generate_block)
  (case_statement)
  (case_generate_construct)
  (specify_block)
  (udp_table)
  (port_list)
  (port_connection_list)
  (parameter_port_list)
] @fold
`}},xml:{wasm:"tree-sitter-xml.wasm",title:"XML",scope:"text.xml",fileTypes:["xml","xsd","dtd","xsl","xslt","svg","plist","rss","atom","xhtml","xib","storyboard","csproj","vcxproj","props","targets","nuspec","resx","wsdl"],injectionRegex:"^(xml|svg|xsd|xslt?|plist)$",queries:{highlights:`; Highlights for XML.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(comment) @comment

; Elements

(tag_name) @tag

(attribute_name) @tag.attribute

(attribute_value) @string

[
  (entity_reference)
  (character_reference)
] @string.escape

(cdata) @string

; Prolog and processing instructions

(xml_declaration
  "xml" @keyword.directive)

(pi_target) @keyword.directive

; Document type declarations

[
  "<!DOCTYPE"
  "<!ELEMENT"
  "<!ATTLIST"
  "<!ENTITY"
  "<!NOTATION"
  "<![CDATA["
  "<!["
  "SYSTEM"
  "PUBLIC"
  "NDATA"
  "NOTATION"
  "INCLUDE"
  "IGNORE"
  "#PCDATA"
  "#REQUIRED"
  "#IMPLIED"
  "#FIXED"
  (empty)
  (any)
] @keyword

(attribute_type) @type.builtin

(doctype
  name: (name) @tag)

(element_declaration
  name: (name) @tag)

[
  (content_choice)
  (content_sequence)
  (mixed_content)
] @tag

(attlist_declaration
  name: (name) @tag)

(attribute_definition
  name: (name) @tag.attribute)

(entity_declaration
  name: (name) @constant)

(notation_declaration
  name: (name) @type)

(notation_type
  (name) @type)

(entity_declaration
  notation: (name) @type)

(nmtoken) @constant

[
  (system_literal)
  (pubid_literal)
  (entity_value)
] @string

(parameter_entity_reference) @string.special

; Punctuation

[
  "<"
  ">"
  "</"
  "/>"
  "<?"
  "?>"
  "["
  "]"
  "]]>"
  "("
  ")"
] @punctuation.bracket

[
  "="
  "|"
  ","
] @punctuation.delimiter

[
  "?"
  "*"
  "+"
] @operator
`,folds:`[
  (element)
  (internal_subset)
  (conditional_section)
  (comment)
  (cdata_section)
] @fold
`}},yaml:{wasm:"tree-sitter-yaml.wasm",title:"YAML",scope:"source.yaml",fileTypes:["yaml","yml","clang-format","clang-tidy","gemrc","CITATION.cff"],injectionRegex:"^(yaml|yml)$",queries:{highlights:`; Highlights for YAML.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

; Scalars
; -------

[
  (string_scalar)
  (double_quote_scalar)
  (single_quote_scalar)
  (block_scalar)
] @string

(escape_sequence) @string.escape

(null_scalar) @constant.builtin

(boolean_scalar) @boolean

[
  (integer_scalar)
  (float_scalar)
] @number

; Keys
; ----

(block_mapping_pair
  key: (flow_node
    [
      (plain_scalar)
      (double_quote_scalar)
      (single_quote_scalar)
    ] @property))

(flow_pair
  key: (flow_node
    [
      (plain_scalar)
      (double_quote_scalar)
      (single_quote_scalar)
    ] @property))

; The merge key.
(block_mapping_pair
  key: (flow_node
    (plain_scalar
      (string_scalar) @keyword
      (#eq? @keyword "<<"))))

; A key that is a typed scalar (\`1: x\`, \`true: y\`) is still a key.
(block_mapping_pair
  key: (flow_node
    (plain_scalar
      [
        (null_scalar)
        (boolean_scalar)
        (integer_scalar)
        (float_scalar)
      ] @property)))

; Properties and aliases
; ----------------------

(tag) @type

(anchor
  "&" @punctuation.special
  (anchor_name) @label)

(alias
  "*" @punctuation.special
  (alias_name) @label)

; Directives
; ----------

[
  "%YAML"
  "%TAG"
] @keyword.directive

(reserved_directive
  "%" @keyword.directive
  (directive_name) @keyword.directive)

(yaml_version) @number

(tag_handle) @type

(tag_prefix) @string.special

(directive_parameter) @string

; Punctuation
; -----------

[
  "---"
  "..."
] @punctuation.special

[
  "-"
  "?"
  ":"
  ","
] @punctuation.delimiter

[
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(comment) @comment
`,folds:`[
  (block_mapping_pair)
  (block_sequence_item)
  (flow_mapping)
  (flow_sequence)
  (block_scalar)
  (double_quote_scalar)
  (single_quote_scalar)
] @fold
`}},zig:{wasm:"tree-sitter-zig.wasm",title:"Zig",scope:"source.zig",fileTypes:["zig"],injectionRegex:"^zig$",queries:{highlights:`; Highlights for Zig.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Types by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z][a-zA-Z0-9_]*$")
  (#not-match? @type "^[A-Z][A-Z0-9_]+$"))

((identifier) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]+$"))

; Comments
; --------

(doc_comment) @comment.documentation
(container_doc_comment) @comment.documentation
(comment) @comment

; Literals
; --------

(string) @string
(multiline_string) @string
(escape_sequence) @string.escape
(character) @character
(integer) @number
(float) @number.float

((identifier) @constant.builtin
  (#any-of? @constant.builtin "null" "undefined"))

((identifier) @boolean
  (#any-of? @boolean "true" "false"))

(unreachable) @constant.builtin

; Builtins
; --------

(builtin_identifier) @function.builtin

((identifier) @type.builtin
  (#match? @type.builtin
    "^(i|u)[0-9]+$|^(isize|usize|c_char|c_short|c_ushort|c_int|c_uint|c_long|c_ulong|c_longlong|c_ulonglong|c_longdouble|f16|f32|f64|f80|f128|bool|anyopaque|void|noreturn|type|anyerror|comptime_int|comptime_float)$"))

(anyframe) @type.builtin
(anytype) @type.builtin

; Declarations
; ------------

(function_declaration
  name: (identifier) @function)

(test_declaration
  name: (identifier) @function)

(parameter
  name: (identifier) @variable.parameter)

(container_field
  name: (identifier) @property)

; Enum members and other bare fields: \`a,\` / \`a = 1,\` in an enum or union.
(enum_declaration
  (container_field
    type: (identifier) @constant))

(variable_declaration
  name: (identifier) @type
  value: [
    (struct_declaration)
    (enum_declaration)
    (union_declaration)
    (opaque_declaration)
    (error_set_type)
  ])

(variable_declaration
  name: (identifier) @function
  value: (function_type))

; Fields, enum literals and errors
; --------------------------------

(field_expression
  member: (identifier) @property)

(field_initializer
  name: (identifier) @property)

(enum_literal
  name: (identifier) @constant)

(error_value
  name: (identifier) @constant)

(error_set_type
  (identifier) @constant)

; Calls
; -----

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (field_expression
    member: (identifier) @function.method.call))

; Labels and captures
; -------------------

; Block labels on blocks, loops and switches, and break/continue targets.
(_
  label: (identifier) @label)

(payload
  (identifier) @variable)

(pointer_capture
  (identifier) @variable)

; Keywords
; --------

[
  "asm"
  "test"
  "usingnamespace"
] @keyword

[
  "const"
  "var"
] @keyword

[
  "struct"
  "enum"
  "union"
  "opaque"
  "error"
] @keyword.type

(tagged) @keyword.type

[
  "fn"
] @keyword.function

[
  "and"
  "or"
  "orelse"
] @keyword.operator

[
  "return"
] @keyword.return

[
  "if"
  "else"
  "switch"
] @keyword.conditional

(else) @keyword.conditional

[
  "for"
  "while"
  "break"
  "continue"
] @keyword.repeat

[
  "try"
  "catch"
  "errdefer"
] @keyword.exception

[
  "defer"
  "suspend"
  "nosuspend"
  "resume"
] @keyword.coroutine

[
  "pub"
  "export"
  "extern"
  "inline"
  "noinline"
  "threadlocal"
  "comptime"
  "noalias"
  "volatile"
  "allowzero"
  "align"
  "addrspace"
  "linksection"
  "callconv"
  "bitpack"
  "packed"
  "anyframe"
] @keyword.modifier

(container_layout) @keyword.modifier

; Operators
; ---------

[
  "!" "!=" "%" "%=" "&" "&=" "*" "*%" "*%=" "*=" "*|" "*|=" "+" "+%" "+%="
  "++" "+=" "+|" "+|=" "-" "-%" "-%=" "-=" "->" "-|" "-|=" "/" "/=" "<"
  "<<" "<<=" "<<|" "<<|=" "<=" "=" "==" "=>" ">" ">=" ">>" ">>=" "?" "^"
  "^=" "|=" "||" "~" ".." "..." ".*"
] @operator

(variadic_parameter) @operator

; Punctuation
; -----------

[
  "(" ")" "[" "]" "{" "}" "[*"
] @punctuation.bracket

[
  ";" "," "." ":"
] @punctuation.delimiter

(payload
  "|" @punctuation.bracket)

"|" @operator

(pointer_type
  "c" @keyword.modifier)
`,injections:`((comment) @injection.content
  (#set! injection.language "comment"))

((doc_comment) @injection.content
  (#set! injection.language "comment"))

((container_doc_comment) @injection.content
  (#set! injection.language "comment"))

(asm_expression
  template: [
    (string)
    (multiline_string)
  ] @injection.content
  (#set! injection.language "asm"))
`,locals:`; Scopes
; ------

[
  (source_file)
  (block)
  (function_declaration)
  (test_declaration)
  (comptime_declaration)
  (struct_declaration)
  (enum_declaration)
  (union_declaration)
  (opaque_declaration)
  (if_statement)
  (if_expression)
  (for_statement)
  (for_expression)
  (while_statement)
  (while_expression)
  (switch_case)
] @local.scope

; Definitions
; -----------

(variable_declaration
  name: (identifier) @local.definition.var)

(function_declaration
  name: (identifier) @local.definition.function)

(parameter
  name: (identifier) @local.definition.parameter)

(payload
  (identifier) @local.definition.var)

(pointer_capture
  (identifier) @local.definition.var)

(container_field
  name: (identifier) @local.definition.field)

; References
; ----------

(identifier) @local.reference
`,tags:`(function_declaration
  name: (identifier) @name) @definition.function

(test_declaration
  name: (_) @name) @definition.test

(variable_declaration
  name: (identifier) @name
  value: [
    (struct_declaration)
    (union_declaration)
    (opaque_declaration)
  ]) @definition.class

(variable_declaration
  name: (identifier) @name
  value: (enum_declaration)) @definition.enum

(variable_declaration
  name: (identifier) @name
  value: (error_set_type)) @definition.type

(container_field
  name: (identifier) @name) @definition.field

(call_expression
  function: [
    (identifier) @name
    (field_expression
      member: (identifier) @name)
  ]) @reference.call
`,folds:`[
  (block)
  (struct_declaration)
  (enum_declaration)
  (union_declaration)
  (opaque_declaration)
  (error_set_type)
  (switch_expression)
  (initializer_list)
  (parameters)
  (arguments)
  (asm_expression)
  (multiline_string)
] @fold
`}}};var bA="AGFzbQEAAAAAEAhkeWxpbmsuMAEFvHoEHgABxwEZYAF/AX9gAn9/AX9gAX8AYAN/f38AYAN/f38Bf2ACf38AYAR/f39/AX9gBX9/f39/AGAEf39/fwBgAABgAAF/YAV/f39/fwF/YAd/f39/f39/AGAGf3x/f39/AX9gEH9/f39/f39/f39/f39/f38AYAZ/f39/f38AYAZ/f39/f38Bf2ACfn8Bf2AIf39/f39/f38Bf2AGfn9/f39/AX9gB39/f39/f38Bf2ACfH8BfGAEf39/fwF+YAR/fn9/AX9gA39+fwF+AtsDERZ3YXNpX3NuYXBzaG90X3ByZXZpZXcxCGZkX3dyaXRlAAYDZW52FmVtc2NyaXB0ZW5fcmVzaXplX2hlYXAAABZ3YXNpX3NuYXBzaG90X3ByZXZpZXcxB2ZkX3NlZWsAFwNlbnYJX2Fib3J0X2pzAAkWd2FzaV9zbmFwc2hvdF9wcmV2aWV3MQhmZF9jbG9zZQAAA2VudiN0cmVlX3NpdHRlcl9xdWVyeV9wcm9ncmVzc19jYWxsYmFjawAAA2Vudh10cmVlX3NpdHRlcl9wcm9ncmVzc19jYWxsYmFjawABA2Vudhp0cmVlX3NpdHRlcl9wYXJzZV9jYWxsYmFjawAHA2Vudhh0cmVlX3NpdHRlcl9sb2dfY2FsbGJhY2sABQNlbnYPX19zdGFja19wb2ludGVyA38BA2Vudg1fX21lbW9yeV9iYXNlA38AA2VudgxfX3RhYmxlX2Jhc2UDfwAHR09ULm1lbQtfX3N0YWNrX2xvdwN/AQdHT1QubWVtDF9fc3RhY2tfaGlnaAN/AQdHT1QubWVtC19faGVhcF9iYXNlA38BA2VudgZtZW1vcnkCAYAEgIACA2VudhlfX2luZGlyZWN0X2Z1bmN0aW9uX3RhYmxlAXAAHgOdApsCBQUGAAIDBwUFBAAFBQcCAw8DBAADBhADAAARBAQDAgICAQQABQQBAQUBAgQABQMIBwQCAQMIAAAFAAAJAQMEAQACAggSAwEGBQQHDAcIAwMAEwAFBQEBBggAFBUEAAAEBQQEBAQAFgAFBwUECwQDCAEFAgEBAwMICgEBAQEEBAQEAAAAAAsBAQIDAQEEBAQCAAAAAAEABAMEAAAEAAAKAAIAAAAABQAEBQ0EAQQYAgAOAA4AAAAAAAABAAAMAgIAAAACAgICAgICAgACAgIBCQIFBQUAAAACAgUBAQACAAAAAAACAgAAAAAAAAUAAAEAAAAABQICAgIFAgICAgUCAgEBAgAABgsDBQkKAAIABAABAQEBAAUDAQAJCQY+CX8BQQALfwFB6PIAC38BQeDyAAt/AUHs8gALfwFB5PIAC38BQZj0AAt/AUGw9AALfwFBtPoAC38BQbj6AAsHqCGaARFfX3dhc21fY2FsbF9jdG9ycwCjAgZtYWxsb2MAIgZjYWxsb2MAKgdyZWFsbG9jAF4EZnJlZQAzDXRzX3JhbmdlX2VkaXQAUQZtZW1jbXAAEhh0c19sYW5ndWFnZV9zeW1ib2xfY291bnQAoQIXdHNfbGFuZ3VhZ2Vfc3RhdGVfY291bnQAnQIXdHNfbGFuZ3VhZ2VfYWJpX3ZlcnNpb24AmAIQdHNfbGFuZ3VhZ2VfbmFtZQCUAhd0c19sYW5ndWFnZV9maWVsZF9jb3VudACMAhZ0c19sYW5ndWFnZV9uZXh0X3N0YXRlACsXdHNfbGFuZ3VhZ2Vfc3ltYm9sX25hbWUA9wEbdHNfbGFuZ3VhZ2Vfc3ltYm9sX2Zvcl9uYW1lAB4Hc3RybmNtcAAbBnN0cmxlbgBCF3RzX2xhbmd1YWdlX3N5bWJvbF90eXBlAEUddHNfbGFuZ3VhZ2VfZmllbGRfbmFtZV9mb3JfaWQA1wEZdHNfbG9va2FoZWFkX2l0ZXJhdG9yX25ldwDCARx0c19sb29rYWhlYWRfaXRlcmF0b3JfZGVsZXRlALcBIXRzX2xvb2thaGVhZF9pdGVyYXRvcl9yZXNldF9zdGF0ZQC0ARt0c19sb29rYWhlYWRfaXRlcmF0b3JfcmVzZXQAswEadHNfbG9va2FoZWFkX2l0ZXJhdG9yX25leHQArwEkdHNfbG9va2FoZWFkX2l0ZXJhdG9yX2N1cnJlbnRfc3ltYm9sAKsBDXRzX3BvaW50X2VkaXQAkgEQdHNfcGFyc2VyX2RlbGV0ZQCRAQ90c19wYXJzZXJfcmVzZXQAKBZ0c19wYXJzZXJfc2V0X2xhbmd1YWdlAJABHXRzX3BhcnNlcl9zZXRfaW5jbHVkZWRfcmFuZ2VzADoMdHNfcXVlcnlfbmV3AI4BD3RzX3F1ZXJ5X2RlbGV0ZQBLCGlzd3NwYWNlAGYIaXN3YWxudW0AEw10c19xdWVyeV9jb3B5AI0BFnRzX3F1ZXJ5X3BhdHRlcm5fY291bnQAjAEWdHNfcXVlcnlfY2FwdHVyZV9jb3VudACLARV0c19xdWVyeV9zdHJpbmdfY291bnQAigEcdHNfcXVlcnlfY2FwdHVyZV9uYW1lX2Zvcl9pZACJASJ0c19xdWVyeV9jYXB0dXJlX3F1YW50aWZpZXJfZm9yX2lkAIgBHHRzX3F1ZXJ5X3N0cmluZ192YWx1ZV9mb3JfaWQAhwEfdHNfcXVlcnlfcHJlZGljYXRlc19mb3JfcGF0dGVybgCGAR90c19xdWVyeV9zdGFydF9ieXRlX2Zvcl9wYXR0ZXJuAIUBHXRzX3F1ZXJ5X2VuZF9ieXRlX2Zvcl9wYXR0ZXJuAIQBGnRzX3F1ZXJ5X2lzX3BhdHRlcm5fcm9vdGVkAIMBHXRzX3F1ZXJ5X2lzX3BhdHRlcm5fbm9uX2xvY2FsAIIBJnRzX3F1ZXJ5X2lzX3BhdHRlcm5fZ3VhcmFudGVlZF9hdF9zdGVwAKACGHRzX3F1ZXJ5X2Rpc2FibGVfY2FwdHVyZQCfAhh0c19xdWVyeV9kaXNhYmxlX3BhdHRlcm4AngIMdHNfdHJlZV9jb3B5AJYCDnRzX3RyZWVfZGVsZXRlAJUCB3RzX2luaXQAkwISdHNfcGFyc2VyX25ld193YXNtAJICHHRzX3BhcnNlcl9lbmFibGVfbG9nZ2VyX3dhc20AkQIUdHNfcGFyc2VyX3BhcnNlX3dhc20AjwIedHNfcGFyc2VyX2luY2x1ZGVkX3Jhbmdlc193YXNtAIsCHnRzX2xhbmd1YWdlX3R5cGVfaXNfbmFtZWRfd2FzbQCKAiB0c19sYW5ndWFnZV90eXBlX2lzX3Zpc2libGVfd2FzbQCJAhl0c19sYW5ndWFnZV9tZXRhZGF0YV93YXNtAIgCG3RzX2xhbmd1YWdlX3N1cGVydHlwZXNfd2FzbQCHAhl0c19sYW5ndWFnZV9zdWJ0eXBlc193YXNtAIYCFnRzX3RyZWVfcm9vdF9ub2RlX3dhc20AhQIidHNfdHJlZV9yb290X25vZGVfd2l0aF9vZmZzZXRfd2FzbQCEAhF0c190cmVlX2VkaXRfd2FzbQCDAhx0c190cmVlX2luY2x1ZGVkX3Jhbmdlc193YXNtAIICH3RzX3RyZWVfZ2V0X2NoYW5nZWRfcmFuZ2VzX3dhc20AgQIXdHNfdHJlZV9jdXJzb3JfbmV3X3dhc20AgAIYdHNfdHJlZV9jdXJzb3JfY29weV93YXNtAP8BGnRzX3RyZWVfY3Vyc29yX2RlbGV0ZV93YXNtAP4BGXRzX3RyZWVfY3Vyc29yX3Jlc2V0X3dhc20A/QEcdHNfdHJlZV9jdXJzb3JfcmVzZXRfdG9fd2FzbQD8ASR0c190cmVlX2N1cnNvcl9nb3RvX2ZpcnN0X2NoaWxkX3dhc20A+wEjdHNfdHJlZV9jdXJzb3JfZ290b19sYXN0X2NoaWxkX3dhc20A+gEudHNfdHJlZV9jdXJzb3JfZ290b19maXJzdF9jaGlsZF9mb3JfaW5kZXhfd2FzbQD5ATF0c190cmVlX2N1cnNvcl9nb3RvX2ZpcnN0X2NoaWxkX2Zvcl9wb3NpdGlvbl93YXNtAPgBJXRzX3RyZWVfY3Vyc29yX2dvdG9fbmV4dF9zaWJsaW5nX3dhc20A9gEpdHNfdHJlZV9jdXJzb3JfZ290b19wcmV2aW91c19zaWJsaW5nX3dhc20A9QEjdHNfdHJlZV9jdXJzb3JfZ290b19kZXNjZW5kYW50X3dhc20A9AEfdHNfdHJlZV9jdXJzb3JfZ290b19wYXJlbnRfd2FzbQDzASh0c190cmVlX2N1cnNvcl9jdXJyZW50X25vZGVfdHlwZV9pZF93YXNtAPIBKXRzX3RyZWVfY3Vyc29yX2N1cnJlbnRfbm9kZV9zdGF0ZV9pZF93YXNtAPEBKXRzX3RyZWVfY3Vyc29yX2N1cnJlbnRfbm9kZV9pc19uYW1lZF93YXNtAPABK3RzX3RyZWVfY3Vyc29yX2N1cnJlbnRfbm9kZV9pc19taXNzaW5nX3dhc20A7wEjdHNfdHJlZV9jdXJzb3JfY3VycmVudF9ub2RlX2lkX3dhc20A7gEidHNfdHJlZV9jdXJzb3Jfc3RhcnRfcG9zaXRpb25fd2FzbQDtASB0c190cmVlX2N1cnNvcl9lbmRfcG9zaXRpb25fd2FzbQDsAR90c190cmVlX2N1cnNvcl9zdGFydF9pbmRleF93YXNtAOsBHXRzX3RyZWVfY3Vyc29yX2VuZF9pbmRleF93YXNtAOoBJHRzX3RyZWVfY3Vyc29yX2N1cnJlbnRfZmllbGRfaWRfd2FzbQDpASF0c190cmVlX2N1cnNvcl9jdXJyZW50X2RlcHRoX3dhc20A6AEsdHNfdHJlZV9jdXJzb3JfY3VycmVudF9kZXNjZW5kYW50X2luZGV4X3dhc20A5wEgdHNfdHJlZV9jdXJzb3JfY3VycmVudF9ub2RlX3dhc20A5gETdHNfbm9kZV9zeW1ib2xfd2FzbQDlASF0c19ub2RlX2ZpZWxkX25hbWVfZm9yX2NoaWxkX3dhc20A5AEndHNfbm9kZV9maWVsZF9uYW1lX2Zvcl9uYW1lZF9jaGlsZF93YXNtAOMBIXRzX25vZGVfY2hpbGRyZW5fYnlfZmllbGRfaWRfd2FzbQDiASF0c19ub2RlX2ZpcnN0X2NoaWxkX2Zvcl9ieXRlX3dhc20A4QEndHNfbm9kZV9maXJzdF9uYW1lZF9jaGlsZF9mb3JfYnl0ZV93YXNtAOABG3RzX25vZGVfZ3JhbW1hcl9zeW1ib2xfd2FzbQDfARh0c19ub2RlX2NoaWxkX2NvdW50X3dhc20A3gEedHNfbm9kZV9uYW1lZF9jaGlsZF9jb3VudF93YXNtAN0BEnRzX25vZGVfY2hpbGRfd2FzbQDcARh0c19ub2RlX25hbWVkX2NoaWxkX3dhc20A2wEedHNfbm9kZV9jaGlsZF9ieV9maWVsZF9pZF93YXNtANoBGXRzX25vZGVfbmV4dF9zaWJsaW5nX3dhc20A2QEZdHNfbm9kZV9wcmV2X3NpYmxpbmdfd2FzbQDWAR90c19ub2RlX25leHRfbmFtZWRfc2libGluZ193YXNtANUBH3RzX25vZGVfcHJldl9uYW1lZF9zaWJsaW5nX3dhc20A1AEddHNfbm9kZV9kZXNjZW5kYW50X2NvdW50X3dhc20A0wETdHNfbm9kZV9wYXJlbnRfd2FzbQDSASJ0c19ub2RlX2NoaWxkX3dpdGhfZGVzY2VuZGFudF93YXNtANEBIXRzX25vZGVfZGVzY2VuZGFudF9mb3JfaW5kZXhfd2FzbQDQASd0c19ub2RlX25hbWVkX2Rlc2NlbmRhbnRfZm9yX2luZGV4X3dhc20AzwEkdHNfbm9kZV9kZXNjZW5kYW50X2Zvcl9wb3NpdGlvbl93YXNtAM4BKnRzX25vZGVfbmFtZWRfZGVzY2VuZGFudF9mb3JfcG9zaXRpb25fd2FzbQDNARh0c19ub2RlX3N0YXJ0X3BvaW50X3dhc20AzAEWdHNfbm9kZV9lbmRfcG9pbnRfd2FzbQDLARh0c19ub2RlX3N0YXJ0X2luZGV4X3dhc20AygEWdHNfbm9kZV9lbmRfaW5kZXhfd2FzbQDJARZ0c19ub2RlX3RvX3N0cmluZ193YXNtAMgBFXRzX25vZGVfY2hpbGRyZW5fd2FzbQDHARt0c19ub2RlX25hbWVkX2NoaWxkcmVuX3dhc20AxgEgdHNfbm9kZV9kZXNjZW5kYW50c19vZl90eXBlX3dhc20AxQEVdHNfbm9kZV9pc19uYW1lZF93YXNtAMQBGHRzX25vZGVfaGFzX2NoYW5nZXNfd2FzbQDDARZ0c19ub2RlX2hhc19lcnJvcl93YXNtAMEBFXRzX25vZGVfaXNfZXJyb3Jfd2FzbQDAARd0c19ub2RlX2lzX21pc3Npbmdfd2FzbQC/ARV0c19ub2RlX2lzX2V4dHJhX3dhc20AvgEYdHNfbm9kZV9wYXJzZV9zdGF0ZV93YXNtAL0BHXRzX25vZGVfbmV4dF9wYXJzZV9zdGF0ZV93YXNtALwBFXRzX3F1ZXJ5X21hdGNoZXNfd2FzbQC7ARZ0c19xdWVyeV9jYXB0dXJlc193YXNtALkBBm1lbXNldAA0Bm1lbWNweQAkB21lbW1vdmUAoQEIaXN3YWxwaGEAZwhpc3dibGFuawClAQhpc3dkaWdpdACqAQhpc3dsb3dlcgCmAQhpc3dwdW5jdACjAQhpc3d1cHBlcgCiAQlpc3d4ZGlnaXQAngEGbWVtY2hyAGUGc3RyY21wAJ0BB3N0cm5jYXQApAEHc3RybmNweQCfAQh0b3dsb3dlcgCtAQh0b3d1cHBlcgCsAQhzZXRUaHJldwCuARlfZW1zY3JpcHRlbl9zdGFja19yZXN0b3JlAKkBF19lbXNjcmlwdGVuX3N0YWNrX2FsbG9jAKgBHGVtc2NyaXB0ZW5fc3RhY2tfZ2V0X2N1cnJlbnQApwEYX193YXNtX2FwcGx5X2RhdGFfcmVsb2NzAKICCALYAQk/AQAjAgselwGWAZUBoAGcAZoBmQGYATGPAZwCmgKbApkCJZcCmwGUAZMBM5ACjgKNAroBuAG1AbYBsgGxAbABDAEBCpHP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BjYCCAJ/IAMoAgAiBUEBcSIYBEAgAy0AByIKIQggBiEJIA4MAQtBACAGIAUoAhQiBxshCSAFKAIYIQggBSgCECEKIAcgDmoLIQcgCyAWSw0FIAMgF0YNBCAKIAtqIQoCQAJAAkACQAJAIBINACAKIA1JDQAgGA0BIAUoAiRFDQEgBSgCMEUNASAEIAEpAgg3AyggBCABKQIQNwMwIAQgASkCADcDICAEIAIpAgg3AxAgBCACKQIQNwMYIAQgAikCADcDCCAEQegAaiAEQSBqIARBCGoQGCAEKAJ4RQ0BDAgLIBINAQsgCiANSw0BDAILIAogDUkNAQsgAygCACIDQQFxDQAgAygCJEUNACADKAIwDQILIAggCWohBiARQQFqIhEgFUcNAAsMBAsgAy0ALEEBcSAMckUNAAsgACABKQIANwIAIAAgASkCEDcCECAAIAEpAgg3AggMAwsgACABIAEgBEHoAGogDBsgBS8BLEEBcRsiASkCADcCACAAIAEpAhA3AhAgACABKQIINwIIDAILIAAgASkCADcCACAAIAEpAhA3AhAgACABKQIINwIIDAELIABCADcCACAAQgA3AhAgAEIANwIICyAEQYABaiQAC/wUAhN/AX4jAEEwayINJAAgAUEANgIcIAFBADYCECABKAIAIA1BADoALiANQQA7ASwgAkEFdGooAgAhDAJAIAVBAEgEQAwBCyAFQf////8BcUH3////AUYNACAFQQlqIghB/////wFxIQogCEEDdCMIKAIAEQAAIQkgASgCHCEHCyABKAIYIQYgASAHQQFqIgggASgCICILSwR/QQggC0EBdCIHIAggByAISxsiCCAIQQhNGyIHQRhsIQgCfyAGBEAgBiAIIwcoAgARAQAMAQsgCCMIKAIAEQAACyEGIAEgBzYCICABKAIcIgdBAWoFIAgLNgIcIAEgBjYCGCAGIAdBGGxqIghBAToAFCAIQQA2AhAgCCAKNgIMIAhBADYCCCAIIAk2AgQgCCAMNgIAIAggDS0ALjoAFyAIIA0vASw7ABUgASgCHCIUBEAgAkEFdCEXA0AgEUEYbCIVIAEoAhhqIgsoAgAhDiAEIAsgAxEBACICQQJxIRICQAJAAkACQAJAAkACQAJAAkAgAkEBcUUEQCAOLwGQASECIBJFDQQgCygCDCEQIAsoAgghDCALKAIE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KAIkIgMEQANAIAQgA0EDdGshByADIQEDQAJAAkAgByABQQFrIgFBA3RqIggoAgAiAkEBcQ0AIAItACxBwABxRQ0AIAIoAiQhAyAIKAIEIQogAiEEDAELIAENAQsLIAMNAAsLIAAgCjYCECAAIAQ2AgwLIAAgBkEBayICNgIEAkAgAkUNACAJIAtqIQMDQAJAIAIhASAFIAZBBHRqQSBrKAIAIgdBAXFFBEAgBygCJCIIIAUgAUEEdGooAghBAWoiBEsNAQsgACABQQFrIgI2AgQgASEGIAINAQwCCwsgACgCCCICIAZJBEAgBUEIIAJBAXQiASAGIAEgBksbIgEgAUEITRsiAUEEdCMHKAIAEQEAIQUgACABNgIIIAcoAiQhCCAAKAIEIQELIAAgBTYCACAAIAFBAWo2AgQgByAIQQN0ayAEQQN0aikCACEMIAUgAUEEdGoiACADNgIMIAAgBDYCCCAAIAw3AgALC9kEAgd/AX4jAEEgayICJAACQCAAKAKgCSIBRQ0AIAAoAogKIgNFDQAgASgCdCIBRQ0AIAMgARECAAsgAEEANgKICiAAKAKYCgRAIAIgAEGYCmopAgA3AxggAEGICWogAkEYahAKIABCADcCmAoLIABCADcCgAogAEEANgL4CSAAKAIgBEBBACEBIABBADYCfCAAQQA6AIABIABCADcCJCAAQQA2AiAgACgCRCEFAkAgACgCZCIDBEADQAJAIAUgAUEYbGoiBigCFCIHRQ0AIAcgBigCECIETQ0AIAYpAgAhCCAAIAE2AmggACAINwIkIAAgBDYCIEEAIQEgACgCSEUNAyAAKAJsIgMgBE0EQCAEIAAoAnAgA2pJDQQLIABBADYCSCAAQgA3AmwMAwsgAUEBaiIBIANHDQALCyAAIAM2AmggBSADQRhsaiIBQQRrKAIAIQMgAUEQaykCACEIIABBADYCSCAAIAg3AiQgACADNgIgIABCADcCbEEBIQELIABBADYCACAAIAE2AnQLIAAoAoQJEDsgAEHgCWohASAAKALgCQRAIAIgASkCADcDECAAQYgJaiACQRBqEAoLIAAoAugJBEAgAiAAQegJaikCADcDCCAAQYgJaiACQQhqEAoLIAFCADcCACABQQA2AhAgAUIANwIIIAAoArQJBEAgAiAAQbQJaikCADcDACAAQYgJaiACEAog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BUsEf0EIIAVBAXQiBCACIAIgBEkbIgIgAkEITRshAgJ/IAMEQCADIAIjBygCABEBAAwBCyACIwgoAgARAAALIQMgACACNgKMASAAKAKIASIEQQFqBSACCzYCiAEgACADNgKEASADIARqQQo6AAAMBgsgACAEQQFqIgIgACgCjAEiBUsEf0EIIAVBAXQiBCACIAIgBEkbIgIgAkEITRshAgJ/IAMEQCADIAIjBygCABEBAAwBCyACIwgoAgARAAALIQMgACACNgKMASAAKAKIASIEQQFqBSACCzYCiAEgACADNgKEASADIARqQQ06AAAMBQsgACAEQQFqIgIgACgCjAEiBUsEf0EIIAVBAXQiBCACIAIgBEkbIgIgAkEITRshAgJ/IAMEQCADIAIjBygCABEBAAwBCyACIwgoAgARAAALIQMgACACNgKMASAAKAKIASIEQQFqBSACCzYCiAEgACADNgKEASADIARqQQk6AAAMBAsgAkEwRg0CCyABKAIAIQYCQCAEIAEtABAiAmoiBSAAKAKMAU0NAAJ/IAMEQCADIAUjBygCABEBAAwBCyAFIwgoAgARAAALIQMgACAFNgKMASAAKAKIASIHIARNDQAgByAEayIHRQ0AIAMgBWogAyAEaiAH/AoAAAsCQCACRSIFDQAgAyAEaiEEIAYEQCAFDQEgBCAGIAL8CgAADAELIAJFDQAgBEEAIAL8CwALIAAgAzYChAEgACAAKAKIASACajYCiAEMAgsCQAJAAn8CQCACQdwARwRAIAJBCkYNBEEAIAJBIkcNBxogACgChAEhAiABKAIAIgggBGsiAyAAKAKIASIFaiIGIAAoAowBTQ0DIAJFDQEgAiAGIwcoAgARAQAMAgsgACgChAEhAgJAIAEoAgAiByAEayIDIAAoAogBIgVqIgYgACgCjAFNDQACfyACBEAgAiAGIwcoAgARAQAMAQsgBiMIKAIAEQAACyECIAAgBjYCjAEgACgCiAEiCSAFTQ0AIAkgBWsiCUUNACACIAZqIAIgBWogCfwKAAALAkAgBCAHRg0AIAIgBWohBSAEBEAgA0UNASAFIAQgA/wKAAAMAQsgA0UNACAFQQAgA/wLAAsgACACNgKEASAAIAAoAogBIANqNgKIASABKAIAQQFqIQRBAQwGCyAGIwgoAgARAAALIQIgACAGNgKMASAA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KAIAEQIACyAAQQA2AkQgAEIANwI8IAAoAkgiAQRAIAEjCSgCABECAAsgAEEANgJQIABCADcCSCAAKAJUIgEEQCABIwkoAgARAgALIABBADYCXCAAQgA3AlQgACgCYCIBBEAgASMJKAIAEQIACyAAQQA2AmggAEIANwJgIAAoAmwiAQRAIAEjCSgCABECAAsgAEEANgJ0IABCADcCbCAAKAKEASIBBEAgASMJKAIAEQIACyAAQQA2AowBIABCADcChAEgACgCeCIBBEAgASMJKAIAEQIACyAAQQA2AoABIABCADcCeCAAKAKQASIBBEAgASMJKAIAEQIACyAAQQA2ApgBIABCADcCkAECQCAAKAKcASIBRQ0AIAEoAlwNACABKAJoIAFHDQAgASABKAKoASICQQFrNgKoASACQQFHDQAgASMJKAIAEQIACyAAKAIAIgEEQCABIwkoAgARAgALIABBADYCCCAAQgA3AgAgACgCDCIBBEAgASMJKAIAEQIACyAAQQA2AhQgAEIANwIMIAAoAhgiAQRAIAEjCSgCABECAAtBACEBIABBADYCICAAQgA3AhggACgCJCICBEAgAiMJKAIAEQIACyAAQQA2AiwgAEIANwIkIAAoAjQiAgRAA0AgACgCMCABQQxsaiIDKAIAIgQEQCAEIwkoAgARAgAgACgCNCECCyADQQA2AgggA0IANwIAIAFBAWoiASACSQ0ACwsgACgCMCIBBEAgASMJKAIAEQIACyAAQQA2AjggAEIANwIwIAAjCSgCABECAAsLrxsBKX8jAEHQAGsiCyQAIANBADYCQCADQQA2AjQgA0EYaiEXIANBJGohHiADQQxqIRIgC0EOaiEiIAtBDGohKAJAA0ACQCADKAIERQRAIAMoAhxFDQMgIyADKAI0IiNPDQMgCyADKAIINgIQIAsgAykCADcDCCADIBcoAgg2AgggAyAXKQIANwIAIBcgCygCEDYCCCAXIAspAwg3AgAgH0EBaiEfDAELIAMoAgwhCSADKAIkIQQCQCADKAIQIg0gAygCKCIFaiIGIAMoAixNDQAgBkECdCEHAn8gBARAIAQgByMHKAIAEQEADAELIAcjCCgCABEAAAshBCADIAY2AiwgAygCKCIGIAVNDQAgBiAFa0ECdCIGRQ0AIAQgB2ogBCAFQQJ0aiAG/AoAAAsCQCAN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IA0jBygCABEBACEHCyADQgA3A7ABIANCADcDqAEgA0IANwOgASADQgA3A4ABIANBADYCiAEgA0EBNgK8ASADQgA3A5gBIANBADsBjgEgA0IANwN4IANCADcDaCADIAk7AXYgAyACOwGQASADIAUgCHJB/wFxQRhBACAKQf3/A0sbcjsBjAEgAyAENgKUASAHIAxqIgIgAygCvAE2AgAgAiADKQOwATcCHCACIAMpA6gBNwIUIAIgAykDoAE3AgwgAiADKQOYATcCBCACIAMoApQBNgIkIAIgAy8BkAE7ASggAiADLwGOATsBKiACIAMvAYwBOwEsIAIgAygCiAE2AT4gAiADKQOAATcBNiACIAMpA3g3AS4gAiADLwF2OwFCIAIgAykDaDcCRCADQQA2AkQgAyACNgJAIAMgAykDQDcDMCADQTBqIAYQFSADIAMpA0AiFDcDUCADIAMpA0g3AyggDyADQShqEAoMAgsgCCIFDQALQgAhFAsgACAAKAKQCkEBajYCkAoCQAJAIAAoArQJBEAgAyAOKQIANwMgIAMgAykDUDcDGCAAIANBIGogA0EYahBtRQ0BIAMgDikCADcDCCAPIANBCGoQCgsgDiAUNwIADAELIAMgAykDUDcDECAPIANBEGoQCgsgEEEBaiIQIAMoAmBJDQALCyAAKAKECSADKAJcKAIMEBEgACgChAkoAgAgAUEFdGpBAjYCHCADQcABaiQAC6cTAhh/AX4jAEEwayILJAAgC0EkaiAAKAKECSIJIAEjAkEMakEAQQAQGQJ/IAsoAigiGARAIABBhAFqIRMgAEGICWohGQNAIAkgCygCJCICKAIMIAEQJiACIAE2AgxBACERQQAhFANAIAsoAiQgFEEEdGoiAigCBCEVIAIoAgxBBXQiFiAAKAKECSgCAGooAgAvAQAhCiALIAIoAgAiFykCACIaNwMYAkAgGqciAkEBcQ0AQQAhECACKAIkIhJFDQADQCAKIQICQAJAAkACQCALKAIYIgogCigCJEEDdGsgEEEDdGopAgAiGqciB0EBcSIMRQRAQQAhCiAHKAIkQQBHIREgBy8BKCIJQf//A0YNAyAHLQAsQQRxRQ0BIAIhCgwDC0EAIREgB0EIcQRAIAIhCgwECyAHQYD+A3FBCHYhCQwBCyAJQf7/A0YNAQtBACEKAkAgACgCoAki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AQAMAQtB4AEjCCgCABEAAAshAiAAQQg2AhAgACgCDAshByAAIAI2AgggACAHQQFqNgIMIAIgB0EcbGoiAkEANgIYIAJCADcCECACIAY2AgwgAiAINgIIIAIgCTYCBCACIAU2AgAgAEEANgJUIAAoAjgEQCAAKAJQIQdBACECA0AgACgCNCACQQxsakF/NgIEIAAgACgCVCIGQQFqIgUgACgCWCIISwR/QQggCEEBdCIGIAUgBSAGSRsiBSAFQQhNGyIGQQJ0IQUCfyAHBEAgByAFIwcoAgARAQAMAQsgBSMIKAIAEQAACyEHIAAgBjYCWCAAKAJUIgZBAWoFIAULNgJUIAAgBzYCUCAHIAZBAnRqIAI2AgAgAkEBaiICIAAoAjhJDQALCyAAQgA3ApQBIABBATYCrAEgAEEANgJcIAAgATYCACAAQgA3ApwBIABCADcCpAEgAwRAIAAgAzYCnAEgAygCACEBIABBADYCpAEgACABNgKgAQsgBEEgaiQAC/kBAQJ/QbABIwgiASgCABEAACIAQQBBzAD8CwAgAEIANwJQIABBfzYCTCAAQgA3AlggAEIANwKUASAAQX82ApABIABC/////w83AogBIABCgICAgHA3AoABIABC/////w83AnggAEL/////DzcCcCAAQoCAgIBwNwJoIABC/////w83AmAgAEIANwKcASAAQgA3AqQBIABBADYCrAEgAEHAASABKAIAEQAANgIYIABBCDYCICAAKAIkIQEgACgCLEEHTQRAAn8gAQRAIAFBwAEjBygCABEBAAwBC0HAASMIKAIAEQAACyEBIABBCDYCLAsgACABNgIkIAALIwEBfyAAKAJkIAFLBH8gACgCYCABQRxsai0AGAVBAAtBAXELUAEDfyAAKAJMIgJFBEBBAQ8LIAAoAkghA0EAIQADQAJAIAEgAyAAQQZsaiIELwECRw0AIAQtAARBAUYNAEEADwsgAEEBaiIAIAJHDQALQQELEAAgACgCYCABQRxsaigCFAsQACAAKAJgIAFBHGxqKAIQCzYBAX8gACgCYCABQRxsaiIBKAIIIQMgAiABKAIMIgE2AgAgAUUEQEEADwsgACgCVCADQQN0agstAQF/IAAoAiQgAUH//wNxQQN0aiIBKAIAIQMgACgCGCACIAEoAgQ2AgAgA2oLLwEBfyACQf//A3EiAiAAKAIwIAFBDGxqIgAoAgRJBH8gACgCACACai0AAAVBAAsLLQEBfyAAKAIMIAFB//8DcUEDdGoiASgCACEDIAAoAgAgAiABKAIENgIAIANqCwcAIAAoAigLBwAgACgCEAsHACAAKAJkC/ANAQd/IwBBoAFrIgYkAEGkASMIKAIAEQAAIQMgBkEAQZwB/AsAAkAgACgCnAEiAUUNACABKAJcDQAgASgCaCABRw0AIAEgASgCqAFBAWo2AqgBCyAALwGgASECIAMgBkGcAfwKAAAgA0EAOwGiASADIAI7AaABIAMgATYCnAEgAygCPCEBIAAoAjwhBQJAIAAoAkAiBCADKAJETQRAIARBFGwhAgwBCyAEQRRsIQICfyABBEAgASACIwcoAgARAQAMAQsgAiMIKAIAEQAACyEBIAMgBDYCRAsgAyAENgJAIAIEQCABIAUgAvwKAAALIAMgATYCPCADKAJIIQEgACgCSCEFAkAgACgCTCIEIAMoAlBNBEAgBEEGbCECDAELIARBBmwhAgJ/IAEEQCABIAIjBygCABEBAAwBCyACIwgoAgARAAALIQEgAyAENgJQCyADIAQ2AkwgAgRAIAEgBSAC/AoAAAsgAyABNgJIIAMoAlQhASAAKAJUIQUCQCAAKAJYIgQgAygCXE0EQCAEQQN0IQIMAQsgBEEDdCECAn8gAQRAIAEgAiMHKAIAEQEADAELIAIjCCgCABEAAAshASADIAQ2AlwLIAMgBDYCWCACBEAgASAFIAL8CgAACyADIAE2AlQgAygCYCEBIAAoAmAhBQJAIAAoAmQiBCADKAJoTQRAIARBHGwhAgwBCyAEQRxsIQICfyABBEAgASACIwcoAgARAQAMAQsgAiMIKAIAEQAACyEBIAMgBDYCaAsgAyAENgJkIAIEQCABIAUgAvwKAAALIAMgATYCYCADKAJsIQEgACgCbCEFAkAgACgCcCIEIAMoAnRNBEAgBEEDdCECDAELIARBA3QhAgJ/IAEEQCABIAIjBygCABEBAAwBCyACIwgoAgARAAALIQEgAyAENgJ0CyADIAQ2AnAgAgRAIAEgBSAC/AoAAAsgAyABNgJsIAMoAnghASAAKAJ4IQUCQCAAKAJ8IgQgAygCgAFNBEAgBEEBdCECDAELIARBAXQhAgJ/IAEEQCABIAIjBygCABEBAAwBCyACIwgoAgARAAALIQEgAyAENgKAAQsgAyAENgJ8IAIEQCABIAUgAvwKAAALIAMgATYCeCADKAKEASEBIAAoAoQBIQQgACgCiAEiAiADKAKMAUsEQAJ/IAEEQCABIAIjBygCABEBAAwBCyACIwgoAgARAAALIQEgAyACNgKMAQsgAyACNgKIASACBEAgASAEIAL8CgAACyADIAE2AoQBIAMoApABIQEgACgCkAEhBQJAIAAoApQBIgQgAygCmAFNBEAgBEEBdCECDAELIARBAXQhAgJ/IAEEQCABIAIjBygCABEBAAwBCyACIwgoAgARAAALIQEgAyAENgKYAQsgAyAENgKUASACBEAgASAFIAL8CgAACyADIAE2ApABIAMoAgAhASAAKAIAIQQgACgCBCICIAMoAghLBEACfyABBEAgASACIwcoAgARAQAMAQsgAiMIKAIAEQAACyEBIAMgAjYCCAsgAyACNgIEIAIEQCABIAQgAvwKAAALIAMgATYCACADKAIMIQEgACgCDCEFAkAgACgCECIEIAMoAhRNBEAgBEEDdCECDAELIARBA3QhAgJ/IAEEQCABIAIjBygCABEBAAwBCyACIwgoAgARAAALIQEgAyAENgIUCyADIAQ2AhAgAgRAIAEgBSAC/AoAAAsgAyABNgIMIAMoAhghASAAKAIYIQQgACgCHCICIAMoAiBLBEACfyABBEAgASACIwcoAgARAQAMAQsgAiMIKAIAEQAACyEBIAMgAjYCIAsgAyACNgIcIAIEQCABIAQgAvwKAAALIAMgATYCGCADKAIkIQEgACgCJCEFAkAgACgCKCIEIAMoAixNBEAgBEEDdCECDAELIARBA3QhAgJ/IAEEQCABIAIjBygCABEBAAwBCyACIwgoAgARAAALIQEgAyAENgIsCyADIAQ2AiggAgRAIAEgBSAC/AoAAAsgAyABNgIkIAMoAjAhASAAKAIwIQUCQCAAKAI0IgQgAygCOE0EQCAEQQxsIQIMAQsgBEEMbCECAn8gAQRAIAEgAiMHKAIAEQEADAELIAIjCCgCABEAAAshASADIAQ2AjgLIAMgBDYCNCACBEAgASAFIAL8CgAACyADIAE2AjAgAygCNARAQQAhBQNAIAAoAjBBACECIAVBDGwiByADKAIwaiIEQQA2AgggBEIANwIAIAdqIgEoAgAhByAB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NgJgIAUoAmwhAgJAAkAgBSgCcCIBBEAgAUEETwRAIAFBfHEhCEEAIQoDQCACIABBAnRqIgMoAgAjCSIHKAIAEQIAIAMoAgQgBygCABECACADKAIIIAcoAgARAgAgAygCDCAHKAIAEQIAIABBBGohACAKQQRqIgogCEcNAAsLIAFBA3EiA0UNAUEAIQEDQCACIABBAnRqKAIAIwkoAgARAgAgAEEBaiEAIAFBAWoiASADRw0ACwwBCyACRQ0BCyACIwkoAgARAgALQQAhACAFQQA2AmwgBSgCeCECAkACQCAFKAJ8IgEEQCABQQRPBEAgAUF8cSEIQQAhCgNAIAIgAEECdGoiAygCACMJIgcoAgARAgAgAygCBCAHKAIAEQIAIAMoAgggBygCABECACADKAIMIAcoAgARAgAgAEEEaiEAIApBBGoiCiAIRw0ACwsgAUEDcSIDRQ0BQQAhAQNAIAIgAEECdGooAgAjCSgCABECACAAQQFqIQAgAUEBaiIBIANHDQALDAELIAJFDQELIAIjCSgCABECAAtBACEAIAVBADYCeCAFKAKEASECAkACQCAFKAKIASIBBEAgAUEETwRAIAFBfHEhCEEAIQoDQCACIABBAnRqIgMoAgAjCSIHKAIAEQIAIAMoAgQgBygCABECACADKAIIIAcoAgARAgAgAygCDCAHKAIAEQIAIABBBGohACAKQQRqIgogCEcNAAsLIAFBA3EiA0UNAUEAIQEDQCACIABBAnRqKAIAIwkoAgARAgAgAEEBaiEAIAFBAWoiASADRw0ACwwBCyACRQ0BCyACIwkoAgARAgALIAUoApABIgAEQCAAIwkoAgARAgALIAUoApwBIgAEQCAAIwkoAgARAgALIBAEQCAQIwkoAgARAgALIA8EQCAPIwkoAgARAgALIB0jCSgCABECAAsgFgRAIBYjCSgCABECAAsgEwRAIBMjCSgCABECAAsgEUUEQCAEQQU2AgAMAQsgBigChAEiAARAIAAjCSgCABECAAsgBkEANgKMASAGQgA3AoQBDAELIAYQS0EAIQYLIAVBsAFqJAAgBguoAgEJfyABKAIQIgYgACgCBEsEQEEBDwsgASgCACIDLwEAIQkgACgCACIEKAIAIQUgBCgCBCIHIQICQANAIAJFDQEgBSACQQFrIgJBFGxqIggoAgwiCiAGSQ0BIAYgCkcNACAILwEQIAlHDQALQQAPCyAHQQFqIgIgBCgCCCIISwRAQQggCEEBdCIDIAIgAiADSRsiAiACQQhNGyIDQRRsIQICfyAFBEAgBSACIwcoAgARAQAMAQsgAiMIKAIAEQAACyEFIAQgAzYCCCABKAIAIQMgACgCACIEKAIEIgdBAWohAgsgBCACNgIEIAQgBTYCACADKAIMIQEgBSAHQRRsaiIAIAMpAgQ3AgAgAEEAOwESIAAgCTsBECAAIAY2AgwgACABNgIIQQALgAEBAn8gABAoAkAgACgCoAkiAkUNACACKAJcDQAgAigCaCACRw0AIAIgAigCqAEiA0EBazYCqAEgA0EBRw0AIAIjCSgCABECAAtBACECIABBADYCoAkCQCABBEAgASgCAEEQa0F9SQ0BIAEoAlxFDQELIAAgATYCoAlBASECCyACC7EIAQl/IwBBIGsiAyQAIAAEQCAAECgCQCAAKAKgCSIBRQ0AIAEoAlwNACABKAJoIAFHDQAgASABKAKoASICQQFrNgKoASACQQFHDQAgASMJKAIAEQIACyAAQQA2AqAJIAAoAoQJIQEjAEEQayIGJAAgASgCDCICBEAgAiMJKAIAEQIAIAFBADYCFCABQgA3AgwLIAEoAhgiAgRAIAIjCSgCABECACABQQA2AiAgAUIANwIYCyABKAIwIAFBJGoiCCABKAI0EBogASgCBCICBEADQCABKAIAIAVBBXRqIgQoAgAEQCABKAI0IQcgBCgCDARAIAYgBCkCDDcDCCAHIAZBCGoQCgsgBCgCFARAIAYgBCkCFDcDACAHIAYQCgsgBCgCBCICBEAgAigCACIJBEAgCSMJKAIAEQIAIAQoAgQhAgsgAkEANgIIIAJCADcCACACIwkoAgARAgALIAQoAgAgCCAHEBogASgCBCECCyAFQQFqIgUgAkkNAAsLQQAhAiABQQA2AgQgASgCJCIFBEACQCABKAIoBEADQCABKAIkIAJBAnRqKAIAIwkoAgARAgAgAkEBaiICIAEoAihJDQALIAgoAgAiBUUNAQsgBSMJKAIAEQIACyABQQA2AiwgAUIANwIkCyABKAIAIgIEQCACIwkoAgARAgALIAFBADYCCCABQgA3AgAgASMJKAIAEQIAIAZBEGokACAAKAKoCSIBBEAgASMJKAIAEQIAIABBADYCsAkgAEIANwKoCQsgACgCoAoiAQRAIAEjCSgCABECACAAQQA2AqgKIABCADcCoAoLIAAoApgKBEAgAyAAQZgKaikCADcDGCAAQYgJaiADQRhqEAogAEIANwKYCgsgACgCRCMJKAIAEQIAIABB4AlqIQEgACgC4AkEQCADIAEpAgA3AxAgAEGICWogA0EQahAKCyAAKALoCQRAIAMgAEHoCWopAgA3AwggAEGICWogA0EIahAKCyABQgA3AgBBACECIAFBADYCECABQgA3AgggACgCiAkiAQRAAkAgACgCjAkEQANAIAAoAogJIAJBA3RqKAIAIwkoAgARAgAgAkEBaiICIAAoAowJSQ0ACyAAKAKICSIBRQ0BCyABIwkoAgARAgALIABBADYCkAkgAEIANwKICQsgACgClAkiAQRAIAEjCSgCABECACAAQQA2ApwJIABCADcClAkLIAAoAvQJIgEEQCABIwkoAgARAgALIABBADYC/AkgAEIANwL0CSAAKAK8CSIBBEAgASMJKAIAEQIACyAAQQA2AsQJIABCADcCvAkgACgCyAkiAQRAIAEjCSgCABECAAsgAEEANgLQCSAAQgA3AsgJIAAoAtQJIgEEQCABIwkoAgARAgALIABBADYC3AkgAEIANwLUCSAAIwkoAgARAgALIANBIGokAAuzAQIFfwF+IAApAgAiCEIgiKchAyAIpyEEAkAgASgCACIFIAIoAgQiB08EQCADIAIoAiAgAyACKAIYayIGQQAgAyAGTxtqIAQgAigCFCIGSxshAyACKAIcIAQgBmsiBkEAIAQgBk8baiEEIAIoAgggBSAHa2ohBQwBCyAFIAIoAgBNDQAgAikCHCIIQiCIpyEDIAIoAgghBSAIpyEECyAAIAStIAOtQiCGhDcCACABIAU2AgALGwAgACABEF4hAAJAIAFFDQAgAA0AEEQACyAACxsAIAAgARAqIQECQCAARQ0AIAENABBEAAsgAQuQAQEDf0ECIQRBfyEDAkAgAUECSQR/IAEFIAIgAC8BACIDQQh0IANBCHZyIgNB//8DcSIFNgIAIAFBfnFBAkYNASADQYD4A3FBgLADRw0BIAAvAQIiAEEIdCAAQQh2ciIAQYD4A3FBgLgDRw0BIABB//8DcSAFQQp0akGAuP8aayEDQQQLIQQgAiADNgIACyAEC80CAQR/IAIgACwAACIDQf8BcSIENgIAQQEhBQJAIANBAEgEQAJAIAFBAUYNAAJAIANBYE8EQAJAIANBb00EQCACIARBD3EiBDYCACMBQd4KaiAEai0AACAALQABIgNBBXZ2QQFxRQ0EIANBP3EhBkECIQMMAQsgAiAEQfABayIENgIAIANBdEsNAyMBQbAMaiAALQABIgNBBHZqLAAAIAR2QQFxRQ0DIAIgA0E/cSAEQQZ0ciIENgIAQQIhBSABQQJGDQNBAyEDIAAtAAJBgH9zIgZB/wFxQT9LDQMLIAIgBkH/AXEgBEEGdHIiBDYCACADIAEiBUcNAQwCCyADQUJJDQEgAiAEQR9xIgQ2AgBBASEDCyAAIANqLQAAQYB/c0H/AXEiAEE/TQ0CIAMhBQsgAkF/NgIACyAFDwsgAiAEQQZ0IAByNgIAIANBAWoLbgECf0ECIQRBfyEDAkAgAUECSQR/IAEFIAIgAC8BACIDNgIAIAFBfnFBAkYNASADQYD4A3FBgLADRw0BIAAvAQIiAEGA+ANxQYC4A0cNASADQQp0IABqQYC4/xprIQNBBAshBCACIAM2AgALIAQLaQECfwJAIAAoAmgiASAAKAJkRg0AIAFFDQAgACgCICAAKAJEIAFBGGxqIgEoAhBHDQAgAUEEaygCACECIAAgAUEQaykCADcCPCAAIAI2AjgPCyAAIAApAiA3AjggAEFAayAAKAIoNgIAC4YEAgl/AX4jAEEQayIFJAAgAEEBOgB4AkAgAC0AgAENACAAKAIgIgkgACgCKCIEayEBIAAoAiQhAiAEBEAgAEEANgJ8IABBADoAgAELIABBADYCKCAAIAI2AiQgACABNgIgIAAoAkQhBwJAAn8gACgCZCIGBEADQAJAIAcgA0EYbGoiCCgCFCIEIAFNDQAgBCAIKAIQIgJNDQAgASACTQRAIAAgCCkCADcCJCAAIAI2AiAgAiEBCyAAIAM2AmhBACEDIAAoAkhFDQQgACgCbCICIAFNBEAgASAAKAJwIAJqSQ0FCyAAQQA2AkhBAAwDCyADQQFqIgMgBkcNAAsLIAAgBjYCaCAHIAZBGGxqIgJBBGsoAgAhASACQRBrKQIAIQogAEEANgJIIAAgCjcCJCAAIAE2AiBBAQshAyAAQQA2AnALIABBAToAgAEgAEEANgIAIAAgAzYCdCAAQQA2AnwgACABNgJsIAAoAlAhBCAAKAJMIQIgBSAAKQIkNwMIIAAgAiABIAVBCGogAEHwAGogBBEGADYCSCAAKAJwRQRAIABBADYCSCAAIAAoAmQ2AmgMAQsgACgCaCAAKAJkRg0AIAAQKQNAIAAoAiAgCU8NASAAKAJoIAAoAmRGDQEgACgCSEUNASAAQQAQXCAAKAJoIAAoAmRHDQALCyAAKAJ8IAVBEGokAAsrAQJ/IAAoAmgiAiAAKAJkSQR/IAAoAiAgACgCRCACQRhsaigCEEYFQQALCxsBAX8gABAiIQECQCAARQ0AIAENABBEAAsgAQsNACAAKAJoIAAoAmRGC00BAn8gAS0AACECAkAgAC0AACIDRQ0AIAIgA0cNAANAIAEtAAEhAiAALQABIgNFDQEgAUEBaiEBIABBAWohACACIANGDQALCyADIAJrCxcAIABBMGtBCkkgAEEgckHhAGtBBklyC4ICAQJ/AkACQAJAAkAgASAAIgNzQQNxDQAgAkEARyEEAkAgAUEDcUUNACACRQ0AA0AgAyABLQAAIgQ6AAAgBEUNBSADQQFqIQMgAkEBayICQQBHIQQgAUEBaiIBQQNxRQ0BIAINAAsLIARFDQIgAS0AAEUNAyACQQRJDQADQEGAgoQIIAEoAgAiBGsgBHJBgIGChHhxQYCBgoR4Rw0CIAMgBDYCACADQQRqIQMgAUEEaiEBIAJBBGsiAkEDSw0ACwsgAkUNAQsDQCADIAEtAAAiBDoAACAERQ0CIANBAWohAyABQQFqIQEgAkEBayICDQALC0EAIQILIANBACACEDQaIAALSQEBfyMAQRBrIgMkACADIAI2AgwgACgCYARAIABBhAFqIgJBgAggASADKAIMEGAaIAAoAlxBASACIAAoAmARAwALIANBEGokAAvoAgECfwJAIAAgAUYNACABIAAgAmoiBGtBACACQQF0a00EQCAAIAEgAhAkDwsgACABc0EDcSEDAkACQCAAIAFJBEAgAwRAIAAhAwwDCyAAQQNxRQRAIAAhAwwCCyAAIQMDQCACRQ0EIAMgAS0AADoAACABQQFqIQEgAkEBayECIANBAWoiA0EDcQ0ACwwBCwJAIAMNACAEQQNxBEADQCACRQ0FIAAgAkEBayICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQQRrIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkEBayICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AA0AgAyABKAIANgIAIAFBBGohASADQQRqIQMgAkEEayICQQNLDQALCyACRQ0AA0AgAyABLQAAOgAAIANBAWohAyABQQFqIQEgAkEBayICDQALCyAACwsAIABBABAyIABHCz4BAX8gAEH//wdNBH8jAUHA0wBqIgEgASAAQQh2ai0AAEEFdGogAEEDdkEfcWotAAAgAEEHcXZBAXEFQQALC0kBAn8gABBCIABqIQMCQCACRQ0AA0AgAS0AACIERQ0BIAMgBDoAACADQQFqIQMgAUEBaiEBIAJBAWsiAg0ACwsgA0EAOgAAIAALDQAgAEEgRiAAQQlGcgsLACAAQQEQMiAARwsEACMACxAAIwAgAGtBcHEiACQAIAALBgAgACQACwoAIABBMGtBCkkLBwAgAC8BHAsIACAAQQEQMgsIACAAQQAQMgsZACMNKAIARQRAIw4gATYCACMNIAA2AgALC/ICAQV/IAAoAhQiAUECRwRAIAAoAgQhAwJ/AkACQCAALQAQQQFGBEBBAiEBIAAgA0ECaiICNgIEIAAoAgggAkYEQEEAIAAvAQ4iAkUNBBogACACQQFrOwEOIAMvAQIhASAAIANBBmoiAjYCBCAAIAE7AQwgACACIAMvAQRBAXRqNgIIIAAgAy8BBiICOwEcIAAoAgAhBAwCCyAAIAIvAQA7ARwMAgsCQCAAKAIAIgQoAgQiBSABBH8gAC8BHEEBagVBAAsiAkH//wNxIgFNDQADQCADIAFBAXRqLwEADQEgBSACQQFqIgJB//8DcSIBSw0ACwsgASAFTwRAQQIhAUEADAMLIAAgAjsBHCAAIAMgAUEBdGovAQAiATsBDAtBACEDIAAgBCgCDCACQf//A3FLBH8gBCgCNCABQQN0aiIBLQAAIQMgACABQQhqNgIYQQAFIAELOwEeIAAgAzsBIAtBASEBQQELIQIgACABNgIUCyACC6gBAQV/IAAoAlQiAygCACEFIAMoAgQiBCAAKAIUIAAoAhwiB2siBiAEIAZJGyIGBEAgBSAHIAYQJBogAyADKAIAIAZqIgU2AgAgAyADKAIEIAZrIgQ2AgQLIAQgAiACIARLGyIEBEAgBSABIAQQJBogAyADKAIAIARqIgU2AgAgAyADKAIEIARrNgIECyAFQQA6AAAgACAAKAIsIgE2AhwgACABNgIUIAILsgUCBn4EfyABIAEoAgBBB2pBeHEiAUEQajYCACAAIAEpAwAhAyABKQMIIQYjAEEgayIAJAAgBkL///////8/gyECAn4gBkIwiEL//wGDIgSnIghBgfgAa0H9D00EQCACQgSGIANCPIiEIQIgCEGA+ABrrSEEAkAgA0L//////////w+DIgNCgYCAgICAgIAIWgRAIAJCAXwhAgwBCyADQoCAgICAgICACFINACACQgGDIAJ8IQILQgAgAiACQv////////8HViIBGyECIAGtIAR8DAELAkAgAiADhFANACAEQv//AVINACACQgSGIANCPIiEQoCAgICAgIAEhCECQv8PDAELIAhB/ocBSwRAQgAhAkL/DwwBC0GA+ABBgfgAIARQIgkbIgogCGsiAUHwAEoEQEIAIQJCAAwBCyACIAJCgICAgICAwACEIAkbIQJBACEJIAggCkcEQCADIQQgAiEFAkBBgAEgAWsiCEHAAHEEQCADIAhBQGqthiEFQgAhBAwBCyAIRQ0AIAUgCK0iB4YgBEHAACAIa62IhCEFIAQgB4YhBAsgACAENwMQIAAgBTcDGCAAKQMQIAApAxiEQgBSIQkLAkAgAUHAAHEEQCACIAFBQGqtiCEDQgAhAgwBCyABRQ0AIAJBwAAgAWuthiADIAGtIgSIhCEDIAIgBIghAgsgACADNwMAIAAgAjcDCCAAKQMIQgSGIAApAwAiA0I8iIQhAgJAIAmtIANC//////////8Pg4QiA0KBgICAgICAgAhaBEAgAkIBfCECDAELIANCgICAgICAgIAIUg0AIAJCAYMgAnwhAgsgAkKAgICAgICACIUgAiACQv////////8HViIBGyECIAGtCyEDIABBIGokACAGQoCAgICAgICAgH+DIANCNIaEIAKEvzkDAAvcFwMSfwF8A34jAEGwBGsiCyQAIAtBADYCLAJAIAG9IhlCAFMEQCMBQQpqIRRBASEQIAGaIgG9IRkMAQsgBEGAEHEEQCMBQQ1qIRRBASEQDAELIwFBCmoiBkEGaiAGQQFqIARBAXEiEBshFCAQRSEXCwJAIBlCgICAgICAgPj/AINCgICAgICAgPj/AFEEQCAAQSAg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CGoiAARAIAcgEUECdGpBACAA/AsACyAQLwFIIQAgByAPQQJ0aiIBIBAvAUoiAjYCBCABIAA2AgAgD0ECaiEPIAIEQANAIAcgD0ECdGoiACAQKAJMIA1BHGxqIgEoAhg2AgAgASgCACEEIAEoAgghCCABKAIQIQkgASgCBCEKIAAgASgCDDYCFCAAIAo2AgwgACAJNgIEIAAgCEEBdjYCECAAIARBAXY2AgggD0EGaiEPIA1BAWoiDSACRw0ACwsgBkEBaiEGIAJBBmwgA2ohESMBQfT0AGooAgAgEEHEAGoQfQ0ACwsjDCIAIwFB9PQAaigCAC0ArwE2AgggACAHNgIEIAAgBjYCACAQQZABaiQAC9kBAQN/IwBBMGsiASQAIAEjDCICKAIANgIoIAEgAigCDEEBdDYCICABIAA2AiwgASABKQIoNwMQIAEgAigCEDYCJCABIAEpAiA3AwggASACKAIINgIcIAEgAigCBEEBdDYCGCABIAEpAhg3AwAgASgCFCgCCCEDAn8CfyABKAIQKAIAIgBBAXEEQEH//wMgAEEQdiICQf//A0YNAhogAEGA/gNxQQh2DAELQf//AyAALwEqIgJB//8DRg0BGiAALwEoCyEAIAMgAiAAQf//A3EQKwsgAUEwaiQAC3cBAn8jAEEwayIBJAAgASMMIgIoAgA2AiggASACKAIMQQF0NgIgIAEgADYCLCABIAEpAig3AxAgASACKAIQNgIkIAEgASkCIDcDCCABIAIoAgg2AhwgASACKAIEQQF0NgIYIAEgASkCGDcDACABEFkgAUEwaiQAC5sBAQJ/IwBBMGsiASQAIAEjDCICKAIANgIoIAEgAigCDEEBdDYCICABIAA2AiwgASABKQIoNwMQIAEgAigCEDYCJCABIAEpAiA3AwggASACKAIINgIcIAEgAigCBEEBdDYCGCABIAEpAhg3AwACfyABKAIQKAIAIgBBAXEEQCAAQQN2QQFxDAELIAAvASxBAnZBAXELIAFBMGokAAubAQECfyMAQTBrIgEkACABIwwiAigCADYCKCABIAIoAgxBAXQ2AiAgASAANgIsIAEgASkCKDcDECABIAIoAhA2AiQgASABKQIgNwMIIAEgAigCCDYCHCABIAIoAgRBAXQ2AhggASABKQIYNwMAAn8gASgCECgCACIAQQFxBEAgAEEF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AiAgAiADQQF2NgIYIAJBFGohAiAFQQFqIgUgBEcNAAsLIwwiAiAANgIEIAIgBDYCACABQYABaiQAC4ECAgZ/AX4jAEEwayIBJAAgASMMIgIoAgA2AiggASACKAIMQQF0NgIgIAEgADYCLCABIAEpAig3AxAgASACKAIQNgIkIAEgASkCIDcDCCABIAIoAgg2AhwgASACKAIEQQF0NgIYIAEgASkCGDcDACMAQRBrIgQkACABKAIUKAIIIQAgASgCECkCACEHQQEhAgJAAkACQCABLwEMIgNB/v8Daw4CAAIBC0EAIQIMAQsgACgCSCADQQNsai0AACECCyAHIAcgBEEPakEBIAAgAyACQQFxIgIQWkEBaiIFIwgoAgARAAAiBiAFIAAgAyACEFoaIARBEGokACABQTBqJAAgBgt6AQJ/IwBBMGsiASQAIAEjDCICKAIANgIoIAEgAigCDEEBdDYCICABIAA2AiwgASABKQIoNwMQIAEgAigCEDYCJCABIAEpAiA3AwggASACKAIINgIcIAEgAigCBEEBdDYCGCABIAEpAhg3AwAgARBbIAFBMGokAEEBdgt7AQJ/IwBBMGsiASQAIAEjDCICKAIANgIoIAEgAigCDEEBdDYCICABIAA2AiwgASABKQIoNwMQIAEgAigCEDYCJCABIAEpAiA3AwggASACKAIINgIcIAEgAigCBEEBdDYCGCABIAEpAhg3AwAgASgCACABQTBqJABBAXYLlgEBAn8jAEFAaiIBJAAgASMMIgIoAgA2AjggASACKAIMQQF0NgIwIAEgADYCPCABIAEpAjg3AxggASACKAIQNgI0IAEgASkCMDcDECABIAIoAgg2AiwgASACKAIEQQF0NgIoIAEgASkCKDcDCCABQSBqIAFBCGoQQSACIAEoAiA2AgAgAiABKAIkQQF2NgIEIAFBQGskAAueAQECfyMAQUBqIgEkACABIwwiAigCADYCOCABIAIoAgxBAXQ2AjAgASAANgI8IAEgASkCODcDGCABIAIoAhA2AjQgASABKQIwNwMQIAEgAigCCDYCLCABIAIoAgRBAXQ2AiggASABKQIoNwMIIAEgASgCDDYCICABIAEoAhA2AiQgAiABKAIgNgIAIAIgASgCJEEBdjYCBCABQUBrJAAL1wIBBn8jAEHwAGsiASQAIAEjDCICKAIANgJoIAEgAigCDEEBdDYCYCABIAA2AmwgASACKAIINgJcIAEgAigCEDYCZCABIAIoAgRBAXQ2AlggASACKAIYQQF0NgJUIAEgAigCFDYCUCACKAIgIQAgAigCHCEDIAEgASkCaDcDKCABIAEpAmA3AyAgASADNgJIIAEgASkCWDcDGCABIABBAXQ2AkwgASABKQJQNwMQIAEgASkCSDcDCCMAQSBrIgAkACABKAIMIQMgASgCCCEEIAEoAhQhBSABKAIQIQYgACABKQIoNwMYIAAgASkCIDcDECAAIAEpAhg3AwggAUEwaiAAQQhqIAYgBSAEIANBABBUIABBIGokACACIAEoAjw2AhAgAiABKAI0NgIIIAIgASgCQDYCACACIAEoAjhBAXY2AgwgAiABKAIwQQF2NgIEIAFB8ABqJAAL1wIBBn8jAEHwAGsiASQAIAEjDCICKAIANgJoIAEgAigCDEEBdDYCYCABIAA2AmwgASACKAIINgJcIAEgAigCEDYCZCABIAIoAgRBAXQ2AlggASACKAIYQQF0NgJUIAEgAigCFDYCUCACKAIgIQAgAigCHCEDIAEgASkCaDcDKCABIAEpAmA3AyAgASADNgJIIAEgASkCWDcDGCABIABBAXQ2AkwgASABKQJQNwMQIAEgASkCSDcDCCMAQSBrIgAkACABKAIMIQMgASgCCCEEIAEoAhQhBSABKAIQIQYgACABKQIoNwMYIAAgASkCIDcDECAAIAEpAhg3AwggAUEwaiAAQQhqIAYgBSAEIANBARBUIABBIGokACACIAEoAjw2AhAgAiABKAI0NgIIIAIgASgCQDYCACACIAEoAjhBAXY2AgwgAiABKAIwQQF2NgIEIAFB8ABqJAALhgIBBH8jAEHQAGsiASQAIAEjDCICKAIANgJIIAFBQGsiAyACKAIMQQF0NgIAIAEgADYCTCABIAEpAkg3AxggASACKAIQNgJEIAEgAykCADcDECABIAIoAgg2AjwgASACKAIEQQF0NgI4IAEgASkCODcDCCACKAIUQQF0IQMgAigCGEEBdCEEIwBBIGsiACQAIAAgASkCGDcDGCAAIAEpAhA3AxAgACABKQIINwMIIAFBIGogAEEIaiADIARBABBVIABBIGokACACIAEoAiw2AhAgAiABKAIkNgIIIAIgASgCMDYCACACIAEoAihBAXY2AgwgAiABKAIgQQF2NgIEIAFB0ABqJAALhgIBBH8jAEHQAGsiASQAIAEjDCICKAIANgJIIAFBQGsiAyACKAIMQQF0NgIAIAEgADYCTCABIAEpAkg3AxggASACKAIQNgJEIAEgAykCADcDECABIAIoAgg2AjwgASACKAIEQQF0NgI4IAEgASkCODcDCCACKAIUQQF0IQMgAigCGEEBdCEEIwBBIGsiACQAIAAgASkCGDcDGCAAIAEpAhA3AxAgACABKQIINwMIIAFBIGogAEEIaiADIARBARBVIABBIGokACACIAEoAiw2AhAgAiABKAIkNgIIIAIgASgCMDYCACACIAEoAihBAXY2AgwgAiABKAIgQQF2NgIEIAFB0ABqJAALnwIBA38jAEGAAWsiASQAIAEjDCICKAIANgJ4IAEgAigCDEEBdDYCcCABIAA2AnwgASACKAIINgJsIAEgAigCEDYCdCABIAIoAgRBAXQ2AmggASACKAIUNgJgIAEgAigCGEEBdDYCUCABIAIoAhw2AlQgASACKAIgQQF0NgJYIAIoAiQhAyABIAEpAng3AzAgASABKQJwNwMoIAEgADYCZCABIAEpAmg3AyAgASADNgJcIAEgASkCYDcDGCABIAEpAlg3AxAgASABKQJQNwMIIAFBOGogAUEgaiABQQhqEBggAiABKAJENgIQIAIgASgCPDYCCCACIAEoAkg2AgAgAiABKAJAQQF2NgIMIAIgASgCOEEBdjYCBCABQYABaiQAC+AEAgZ/An4jAEHQAGsiASQAIAEjDCIDKAIANgJIIAFBQGsiAiADKAIMQQF0NgIAIAEgADYCTCABIAEpAkg3AxggASADKAIQNgJEIAEgAikCADcDECABIAMoAgg2AjwgASADKAIEQQF0NgI4IAEgASkCODcDCCMAQZABayIAJAACfyABKAIcIgIoAgAiBEEBcQRAIAItAAVBD3EhBSACLQAEIQYgAi0ABgwBCyAEKAIMIQYgBCgCCCEFIAQoAgQLIQQgACACNgKMASAAIAI2AogBIABBADYChAEgACAGNgKAASAAIAU2AnwgACAENgJ4AkAgAiABKAIYIgRHBEAgACAAKQKAATcDUCAAIAApAogBNwNYIAAgACkCeDcDSCAAIAEpAhA3AzggAEFAayABKQIYNwMAIAAgASkCCDcD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KQJINwMYIAIgAygCEDYCRCACIAQpAgA3AxAgAiADKAIINgI8IAIgAygCBEEBdDYCOCACIAIpAjg3AwgjAEEgayIAJAAgACACKQIYNwMYIAAgAikCEDcDECAAIAIpAgg3AwggAkEgaiAAQQhqIAFBABA+IABBIGokACADIAIoAiw2AhAgAyACKAIkNgIIIAMgAigCMDYCACADIAIoAihBAXY2AgwgAyACKAIgQQF2NgIEIAJB0ABqJAAL8AEBA38jAEHQAGsiAiQAIAIjDCIDKAIANgJIIAJBQGsiBCADKAIMQQF0NgIAIAIgADYCTCACIAIpAkg3AxggAiADKAIQNgJEIAIgBCkCADcDECACIAMoAgg2AjwgAiADKAIEQQF0NgI4IAIgAikCODcDCCMAQSBrIgAkACAAIAIpAhg3AxggACACKQIQNwMQIAAgAikCCDcDCCACQSBqIABBCGogAUEBED4gAEEgaiQAIAMgAigCLDYCECADIAIoAiQ2AgggAyACKAIwNgIAIAMgAigCKEEBdjYCDCADIAIoAiBBAXY2AgQgAkHQAGokAAuaAQECfyMAQTBrIgEkACABIwwiAigCADYCKCABIAIoAgxBAXQ2AiAgASAANgIsIAEgASkCKDcDECABIAIoAhA2AiQgASABKQIgNwMIIAEgAigCCDYCHCABIAIoAgRBAXQ2AhggASABKQIYNwMAQQAhAAJAIAEoAhAoAgAiAkEBcQ0AIAIoAiRFDQAgAigCNCEACyABQTBqJAAgAAuaAQECfyMAQTBrIgEkACABIwwiAigCADYCKCABIAIoAgxBAXQ2AiAgASAANgIsIAEgASkCKDcDECABIAIoAhA2AiQgASABKQIgNwMIIAEgAigCCDYCHCABIAIoAgRBAXQ2AhggASABKQIYNwMAQQAhAAJAIAEoAhAoAgAiAkEBcQ0AIAIoAiRFDQAgAigCMCEACyABQTBqJAAgAAucAQECfyMAQTBrIgEkACABIwwiAigCADYCKCABIAIoAgxBAXQ2AiAgASAANgIsIAEgASkCKDcDECABIAIoAhA2AiQgASABKQIgNwMIIAEgAigCCDYCHCABIAIoAgRBAXQ2AhggASABKQIYNwMAAn8gASgCECgCACIAQQFxBEAgAEGA/gNxQQh2DAELIAAvASgLQf//A3EgAUEwaiQAC/oB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JAAgASAANgIMIAEjDCIAKQMANwIQIAEgACkDCDcCGCABQQxqEG4gAUEgaiQAC2cBAX8jAEHQAGsiASQAIAEgADYCPCABIwwiACkDADcCQCABIAApAwg3AkggAUEkaiABQTxqEBAgASABKQI0NwMYIAEgASkCLDcDECABIAEpAiQ3AwggAUEIahBbIAFB0ABqJABBAXYLZQEBfyMAQdAAayIBJAAgASAANgI8IAEjDCIAKQMANwJAIAEgACkDCDcCSCABQSRqIAFBPGoQECABIAEpAjQ3AxggASABKQIsNwMQIAEgASkCJDcDCCABKAIIIAFB0ABqJABBAXYLfQEBfyMAQdAAayIBJAAgASAANgI8IAEjDCIAKQMANwJAIAEgACkDCDcCSCABQSRqIAFBPGoQECABIAEpAjQ3AxAgASABKQIsNwMIIAEgASkCJDcDACABQRxqIAEQQSAAIAEoAhw2AgAgACABKAIgQQF2NgIEIAFB0ABqJAALiAEBAX8jAEHQAGsiASQAIAEgADYCPCABIwwiACkDADcCQCABIAApAwg3AkggAUEkaiABQTxqEBAgASABKQI0NwMQIAEgASkCLDcDCCABIAEpAiQ3AwAgASABKAIENgIcIAEgASgCCDYCICAAIAEoAhw2AgAgACABKAIgQQF2NgIEIAFB0ABqJAALQgEBfyMAQTBrIgEkACABIAA2AhwgASMMIgApAwA3AiAgASAAKQMINwIoIAFBBGogAUEcahAQIAEoAhQgAUEwaiQAC4UBAQF/IwBB0ABrIgEkACABIAA2AjwgASMMIgApAwA3AkAgASAAKQMINwJIIAFBJGogAUE8ahAQIAEgASkCNDcDGCABIAEpAiw3AxAgASABKQIkNwMIAn8gASgCGCgCACIAQQFxBEAgAEEFdkEBcQwBCyAALwEsQQl2QQFxCyABQdAAaiQAC2QBAX8jAEHQAGsiASQAIAEgADYCPCABIwwiACkDADcCQCABIAApAwg3AkggAUEkaiABQTxqEBAgASABKQI0NwMYIAEgASkCLDcDECABIAEpAiQ3AwggAUEIahA/IAFB0ABqJAALZAEBfyMAQdAAayIBJAAgASAANgI8IAEjDCIAKQMANwJAIAEgACkDCDcCSCABQSRqIAFBPGoQECABIAEpAjQ3AxggASABKQIsNwMQIAEgASkC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AQJ/IwBBIGsiASQAIAEgADYCDCABIwwiACkDADcCECABIAApAwg3AhggAUEMahAcIAAgASkCEDcDACAAIAEpAhg3AwggAUEgaiQAC04BAX8jAUGrCmohAgJAAkACQCABQf7/A2sOAgACAQsjAUGqCmoPC0EAIQIgACgCCCAAKAIEaiABTQ0AIAAoAjggAUECdGooAgAhAgsgAgt+AgF/AX4jAEEwayIBJAAgASAANgIcIAEjDCIAKQMANwIgIAEgACkDCDcCKCABIAAoAhRBAXQ2AhggASAAKAIQNgIUIAEgASkCFDcDCCABQRxqQQAgASgCCCABKAIMEG8gACABKQIgNwMAIAAgASkCKDcDCCABQTBqJABCAFkLXQIBfwF+IwBBIGsiASQAIAEgADYCDCABIwwiACkDADcCECABIAApAwg3AhggAUEMaiAAKAIQQQF0QQBBABBvIAAgASkCEDcDACAAIAEpAhg3AwggAUEgaiQAQgBZC18BA38jAEEgayIBJAAgASAANgIMIAEjDCIAKQMANwIQIAEgACkDCDcCGCABQQxqIQIDQCACEHAiA0EBRg0ACyADQQJGIAAgASkCEDcDACAAIAEpAhg3AwggAUEgaiQAC0wBAn8jAEEgayIBJAAgASAANgIMIAEjDCIAKQMANwIQIAEgACkDCDcCGCABQQxqECwgACABKQIQNwMAIAAgASkCGDcDCCABQSBqJAALugIBBX8jAEEwayICJAAgAiAANgIcIAIjDCIDKQMANwIgIAIgAykDCDcCKCACIAMpAxA3AgwgAiADKQMYNwIUIAIgATYCCCACIAIoAgg2AhwgAi8BGCEAIAJBADYCJCACIAA7ASwgAigCICEAIAIoAgwhBgJAAkAgAigCECIEIAIoAihLBEAgBEEcbCEBAn8gAARAIAAgASMHKAIAEQEADAELIAEjCCgCABEAAAshACACIAQ2AiggAigCJCIFRQ0BIAVBHGwiBUUNASAAIAFqIAAgBfwKAAAMAQsgBEUNASAEQRxsIQELIAYEQCABRQ0BIAAgBiAB/AoAAAwBCyABRQ0AIABBACAB/AsACyACIAA2AiAgAiACKAIkIARqNgIkIAMgAikCIDcDACADIAIpAig3AwggAkEwaiQAC9kBAgh/AX4jAEHQAGsiASQAIAEjDCICKAIANgJIIAFBQGsiAyACKAIMQQF0NgIAIAEgADYCTCACKAIgIQQgAikDGCEJIAIoAhQhBSACKAIEIQYgAigCCCEHIAIoAhAhCCABIAEpAkg3AxggASAINgJEIAEgAykCADcDECABIAc2AjwgASAGQQF0NgI4IAEgBTYCKCABIAk3AiwgASAENgI0IAEgADYCJCABIAEpAjg3AwggAUEkaiABQQhqEC0gAiABKQIoNwMAIAIgASkCMDcDCCABQdAAaiQAC1MBAX8jAEEgayIBJAAgASAANgIMIAEjDCIAKQMANwIQIAEgACkDCDcCGCABKAIQIgAEQCAAIwkoAgARAgALIAFBADYCGCABQgA3AhAgAUEgaiQAC8oBAQd/IwBBMGsiASQAIAEgADYCHCABIwwiAykDADcCICABIAMpAwg3AihBACEAIAEvASwhBiABKAIcIQcCQCABKAIkIgRFDQAgASgCICEFIARBHGwiAiMIKAIAEQAAIQAgBQRAIAJFDQEgACAFIAL8CgAADAELIAJFDQAgAEEAIAL8CwALIAFBADsBGiABIAY7ARggASAENgIUIAEgBDYCECABIAA2AgwgASAHNgIIIAMgASkCDDcDACADIAEpAhQ3AwggAUEwaiQAC5oBAQN/IwBB0ABrIgEkACABIwwiAigCADYCSCABQUBrIgMgAigCDEEBdDYCACABIAA2AkwgASABKQJINwMYIAEgAigCEDYCRCABIAMpAgA3AxAgASACKAIINgI8IAEgAigCBEEBdDYCOCABIAEpAjg3AwggAUEkaiABQQhqEHEgAiABKQIoNwMAIAIgASkCMDcDCCABQdAAaiQAC84wAht/A34jAEEQayIYJAAjAEFAaiIHJAAgB0EANgI8IAdCADcCJCAHQgA3AhwCfyAAKAIAIgJBAXEEQCAALQAEIQ0gAC0ABiEMIAAtAAVBD3EMAQsgAigCDCENIAIoAgQhDCACKAIICyEIIAdBADsBPCAHIAA2AiwgB0HgASMIKAIAEQAAIgI2AjAgB0KBgICAgAE3AjQgAkEANgIYIAJCADcCECACIA02AgwgAiAINgIIIAIgDDYCBCACIAA2AgACfyABKAIAIgJBAXEEQCABLQAEIQ0gAS0ABiEMIAEtAAVBD3EMAQsgAigCDCENIAIoAgQhDCACKAIICyECIAdBADsBKCAHIAE2AhggBygC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ISAAKAIQIAAoAgRqCyIKIAFqIQcgI0IgiKchFSAjpyEGAkAgCSAFBH8gBEHwAXFBBHYFIAAoAhwLIAdqSwRAIAMhAAwBCwJAAkAgASAMTQRAIAJFDQIgASAMRw0CIApFDQIgGiAGIB9NcUUNAQwCCyAaIAYgH01xDQELIAUEfyAAQQd2QQFxBSAALQAtQQFxC0UEQCADIQAMBAsgESAWRgRAIAMhAAwECyAGIA5NDQAgAyEADAMLQgAhJEEAIQpBACEEQgAhIyABIAlJBEAgCSABayEEIBwgBmsiAEEAIAAgHE0brSAbIBsgFWsiAEEAIAAgG00bIAYgHEkbrUIghoQhIwsgASAMSQRAIAwgAWshCiAOIAZrIgBBACAAIA5NG60gESARIBVrIgBBACAAIBFNGyAGIA5JG61CIIaEISQLAn8gASAQTwRAQgAhJ0EADAELICVCIIinIgAgACAVayIFQQAgACAFTxsgJaciACAGSxutQiCGIAAgBmsiBUEAIAAgBU8brYQhJyAQIAFrCyEFAn8gByAJSwRAICghJiAJDAELICghJiAJIAcgCUYgCSAMRnENABogJSEmIAQiCiEFICMiJCEnIBALIRACQCADQQFqIgAgGU0NAEEIIBlBAXQiASAAIAAgAUkbIgEgAUEITRsiGUEobCEBIAgEQCAIIAEjBygCABEBACEIDAELIAEjCCgCABEAACEICyAIIANBKGxqIgMgJzcCICADIAU2AhwgAyAkNwIUIAMgCjYCECADICM3AgggAyAENgIEIAMgFDYCACAAIQMgJiElCyAGIA9qrSAgICFqQQAgFSAPG2qtQiCGhCEjIAchASACQQFqIgIgIkcNAAsLIAANAAsgCARAIAgjCSgCABECAAsgCyALKQIINwIQIA1BMGokACAXIAspAxA3AgAgCygCGCIABEACQCALKAIcIgJFDQBBACEDIAJBBE8EQCACQXxxIQUDQCAAIANBA3RqIgEoAgAjCSIEKAIAEQIAIAEoAgggBCgCABECACABKAIQIAQoAgARAgAgASgCGCAEKAIAEQIAIANBBGohAyAdQQRqIh0gBUcNAAsLIAJBA3EiAkUNAANAIAAgA0EDdGooAgAjCSgCABECACADQQFqIQMgHkEBaiIeIAJHDQALCyAAIwkoAgARAgALIAsoAiQiAARAIAAjCSgC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NwJsCyAAQQA2ArAJIABBADYCACAAIAI2AnQgAEIANwKoCSAAQcAAIwgiASgCABEAADYCqAkgAEEENgKwCUGAAiABKAIAEQAAIQEgAEIANwKUCSAAQoCAgICABDcCjAkgACABNgKICSAAQZwJakEANgIAQQFBOCMKKAIAEQEAIgFCADcCACABQgA3AiggAUIANwIgIAFCADcCGCABQgA3AhAgAUIANwIIIAFBgAEjCCgCABEAADYCACABQQQ2AgggASgCDCECIAEoAhRBA00EQAJ/IAIEQCACQcAAIwcoAgARAQAMAQtBwAAjCCgCABEAAAshAiABQQQ2AhQLIAEgAjYCDCABKAIYIQIgASgCIEEDTQRAAn8gAgRAIAJB4AAjBygCABEBAAwBC0HgACMIKAIAEQAACyECIAFBBDYCIAsgASACNgIYIAEoAiQhAiABKAIsQTFNBEACfyACBEAgAkHIASMHKAIAEQEADAELQcgBIwgoAgARAAALIQIgAUEyNgIsCyABIABBiAlqIgM2AjQgASACNgIkAn8gASgCKCIEBEAgASAEQQFrIgQ2AiggAiAEQQJ0aigCAAwBC0GkASMIKAIAEQAACyICQQE7AQAgAkECakEAQZIB/AsAIAJCADcCBCACQQE2ApQBIAJBADYCDCACQgA3ApgBIAJBADYCoAEgASACNgIwIAEQOyAAQgA3AvQJIABCADcCtAkgACABNgKECSAAQfwJakIANwIAIABBhApqQQA2AgAgAEIANwKUCiAAQgA3AogKIABBADYCoAkgAEGcCmpCADcCACAAQaQKakIANwIAIABBADYCwAogAEHDCmpBADYAACAAQeAJaiEBIAAoAuAJBEAgBSABKQIANwMIIAMgBUEIahAKCyAAKALoCQRAIAUgAEHoCWopAgA3AwAgAyAFEAoLIAFCADcCACABQQA2AhAgAUIANwIIIAVBEGokACAGQYDQAEEBECo2AgQgBiAANgIACxQBAX8jDCIAQo+AgIDQATcDACAACxgBAX8gACgCAEEPTwR/IAAoAogBBUEACwvBAwEJfyMAQSBrIgIkACAABEAgAkIANwMYIAJCADcDECACQgA3AwggAiAAKQIANwMAIAJBCGogAhAKIAIoAggiAwRAAkAgAigCDCIERQ0AIARBBE8EQCAEQXxxIQkDQCADIAFBA3Rq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byBtYW55IHZlcnNpb25zAGhhc19jaGFuZ2VzAHN3aXRjaCBmcm9tX2tleXdvcmQ6JXMsIHRvX3dvcmRfdG9rZW46JXMAc3RhdGVfbWlzbWF0Y2ggc3ltOiVzAHNlbGVjdF9zbWFsbGVyX2Vycm9yIHN5bWJvbDolcywgb3Zlcl9zeW1ib2w6JXMAc2VsZWN0X2VhcmxpZXIgc3ltYm9sOiVzLCBvdmVyX3N5bWJvbDolcwBzZWxlY3RfZXhpc3Rpbmcgc3ltYm9sOiVzLCBvdmVyX3N5bWJvbDolcwBjYW50X3JldXNlX25vZGUgc3ltYm9sOiVzLCBmaXJzdF9sZWFmX3N5bWJvbDolcwBza2lwX3Rva2VuIHN5bWJvbDolcwBpZ25vcmVfZW1wdHlfZXh0ZXJuYWxfdG9rZW4gc3ltYm9sOiVzAHJldXNhYmxlX25vZGVfaGFzX2RpZmZlcmVudF9leHRlcm5hbF9zY2FubmVyX3N0YXRlIHN5bWJvbDolcwByZXVzZV9ub2RlIHN5bWJvbDolcwBwYXN0X3JldXNhYmxlX25vZGUgc3ltYm9sOiVzAGJlZm9yZV9yZXVzYWJsZV9ub2RlIHN5bWJvbDolcwBjYW50X3JldXNlX25vZGVfJXMgdHJlZTolcwBicmVha2Rvd25fdG9wX29mX3N0YWNrIHRyZWU6JXMAZGV0ZWN0X2Vycm9yIGxvb2thaGVhZDolcwAoJXMAaXNfZXJyb3IAc2tpcF91bnJlY29nbml6ZWRfY2hhcmFjdGVyAG5hbgBcbgBpc19taXNzaW5nAHJlc3VtZV9wYXJzaW5nAHJlY292ZXJfZW9mAGluZgBuZXdfcGFyc2UAY29uZGVuc2UAZG9uZQBpc19mcmFnaWxlAGNvbnRhaW5zX2RpZmZlcmVudF9pbmNsdWRlZF9yYW5nZQBza2lwIGNoYXJhY3RlcjolZABjb25zdW1lIGNoYXJhY3RlcjolZABzZWxlY3RfaGlnaGVyX3ByZWNlZGVuY2Ugc3ltYm9sOiVzLCBwcmVjOiVkLCBvdmVyX3N5bWJvbDolcywgb3RoZXJfcHJlYzolZABzaGlmdF9leHRyYQBub19sb29rYWhlYWRfYWZ0ZXJfbm9uX3Rlcm1pbmFsX2V4dHJhAF9fUk9PVF9fAF9FUlJPUgBOQU4ATUlTU0lORwBJTkYASU5WQUxJRABsZXhlZF9sb29rYWhlYWQgc3ltOgAgMDAwMDAwMDAwMDAwEDAwAC4AKCVzKQAobnVsbCkAKE5VTEwpACgiJXMiKQAnXHQnACdccicAJ1xuJwBza2lwIGNoYXJhY3RlcjonJWMnAGNvbnN1bWUgY2hhcmFjdGVyOiclYycAJ1wwJwAiJXMiAChNSVNTSU5HIAAoVU5FWFBFQ1RFRCAAJXM6IAAKCgAAAAAAAAAAAAAAAQAAAAAAAAAAAAAA//////////8AAAAA/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4PDw8AAAAAAAAAAAEAAAABAAAAAgAAAAEAAAACAAAAAQAAAAIAAAABAAAAAgAAAAAAAAAAAAAAEhETFBUWFxgZGhscHR4fICERIiMkESUmJygpKissES0uLxAQMBAQEBAQEBAxMjMQNDUQEBERERERERERERERERERERERERERERERERE2ERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERNxERERE4ETk6Ozw9PhERERERERERERERERERERERERERERERERERERERERERERERERERERERERE/EBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEUBBEUJDREVGR0hJShFLTE1OT1BREFJTVFVWV1hZWltcXRBeX2AQERERYWJjEBAQEBAQEBAQEBERERFkEBAQEBAQEBAQEBAQEBAQERFlEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQERFmZxAQaGkREREREREREREREREREREREREREREREWoREWsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEWxtEBAQEBAQEBAQbhAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQb3BxchAQEBAQEBAQc3R1EBAQEBB2dxAQEBB4EBB5EBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////////////////////////////////////////AAAAAAAAAAD+//8H/v//BwAAAAAABCAE//9/////f//////////////////////////////////D/wMAH1AAAAAAAAAAAAAAIAAAAAAA37xA1///+////////////7///////////////////////wP8///////////////////////////+////fwL//////wEAAAAA/7+2AP///4cHAAAA/wf//////////v/D////////////////7x/+4f+fAAD///////8A4P///////////////wMA//////8HMAT////8/x8AAP///wH/BwAAAAAAAP//3z8AAPD/+AP////////////v/9/h/8///v/vn/n///3F459ZgLDP/wMQ7of5///9bcOHGQJewP8/AO6/+////e3jvxsBAM//AB7un/n///3t458ZwLDP/wIA7Mc91hjH/8PHHYEAwP8AAO/f/f///f/j3x1gB8//AADv3/3///3v498dYEDP/wYA79/9/////+ffXfCAz/8A/Oz/f/z///svf4Bf/8D/DAD+/////3//Bz8g/wMAAAAA1vf//6///ztfIP/zAAAAAAEAAAD/AwAA//7///8f/v8D///+////HwAAAAAAAAAA////////f/n/A////////////z//////vyD///////f///////////89fz3//////z3/////PX89/3//////////Pf//////////BwAAAAD//wAA/////////////z8//v//////////////////////////////////////////////////////////n////v//B////////////8f/Af/fDwD//w8A//8PAP/fDQD////////P//8BgBD/AwAAAAD/A///////////////Af//////B///////////PwD///9//w//AcD/////Px8A//////8P////A/8DAAAAAP///w//////////f/7/HwD/A/8DgAAAAAAAAAAAAAAA////////7//vD/8DAAAAAP//////8////////7//AwD///////9/AP/j//////8//wH//////+cAAAAAAN5vBP///////////////////////////////wAAAACA/x8A//8/P/////8/P/+q////P////////99f3B/PD/8f3B8AAAAAAAAAAAAAAAAAAAKAAAD/HwAAAAAAAAAAAAAAAIT8Lz5Qvf/z4EMAAP//////AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMD///////8DAAD//////3///////3//////////////////////H3gMAP////+/IP////////+AAAD//38Af39/f39/f3//////AAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA/gM+H/7///////////9/4P7/////////////9+D///////7/////////////fwAA////BwAAAAAAAP///////////////////////////////z8AAAAAAAAAAAD///////////////////////////////////////8AAP//////////////////////HwAAAAAAAAAA//////8//x////8PAAD//////3/wj///////////////////AAAAAID//P////////////////n///////98AAAAAACA/7//////AAAA////////DwD//////////y8A/wMAAPzo//////8H/////wcA////H/////////f/AID/A////3////////9/AP8//wP//3/8/////////38FAAA4//88AH5+fgB/f///////9/8A////////////////////B/8D//////////////////////////8PAP//f/j//////w//////////////////P/////////////////8DAAAAAH8A+OD//X9f2/////////////////8DAAAA+P///////////////z8AAP///////////P///////wAAAAAA/w8AAAAAAAAAAAAAAAAAAN//////////////////////HwAA/wP+//8H/v//B8D/////////////f/z8/BwAAAAA/+///3///7f/P/8/AAAAAP///////////////////wcAAAAAAAAAAP///////x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8f////////AQAAAAAA/////wDg////B///////B////z//////D/8+AAAAAAD/////////////////////////P/8D/////w//////D///////AP///////w8AAAAAAAAAAAAAAAAAAAAAAAAA////////fwD//z8A/wAAAAAAAAAAAAAAAAAAAAAAAAA//f////+/kf//PwD//38A////fwAAAAAAAAAA//83AP//PwD///8DAAAAAAAAAAD/////////wAAAAAAAAAAAb/Dv/v//PwAAAAAA////H////x8AAAAA//7//x8AAAD///////8/AP//PwD//wcA//8DAAAAAAAAAAAAAAAAAP///////////wEAAAAAAAD///////8HAP///////wcA//////8A/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8fgAD//z8AAAAAAAAAAAAAAAAAAAAAAAAA//9/AP//////////PwAAAMD/AAD8////////AQAA////Af8D////////x/9wAP////9HAP//////////HgD/FwAAAAD///v///+fQAAAAAAAAAAAf73/v/8B/////////wH/A++f+f///e3jnxmB4A8AAAAAAAAAAAAAAAAAAAAAAAAA//////////+7B/+DAAAAAP//////////swD/AwAAAAAAAAAAAAAAAAAAAAAAAAAA////////P38AAAA/AAAAAP////////9/EQD/AwAAAAD///////8/Af8DAAAAAAAA////5/8H/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////////AQAAAAAAAAAAAAAAAP///////////wMAgAAAAAAAAAAAAAAAAAAAAAAAAAAA//z///////waAAAA////////538AAP///////////yAAAAAA/////////wH//f////9/fwEA/wMAAPz////8///+fwAAAAAAAAAAAH/7/////3+0ywD/A7/9////f3sB/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//fwD/////////////////////////AwAAAAAAAAAAAAAAAP////////////////9/AAD///////////////////////////////8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////////fwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////////wH///9//wMAAAAAAAAAAAAAAAD///8/AAD///////8AAA8A/wP4///g//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////8AAAAAAAAAAAAAAAAAAAAA////////////h/////////+A//8AAAAAAAAAAAsAAAD/////////////////////////////////////////AP///////////////////////////////////////wcA////fwAAAAAAAAcA8AD/////////////////////////////////////////////////////////////////D/////////////////8H/x//Af9DAAAAAAAAAAAAAAAA/////////////9///////////99k3v/r7/////////+/59/f////e1/8/f//////////////////////////////////////////////////////P/////3///f////3///f////3///f////3/////9/////f//98////////9////52wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////H4A//0MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8P/wP///////////////////////////////8fAAAAAAAAAP//////////jwj/AwAAAAAAAAAAAAAAAAAAAAAAAAAA7////5b+9wqE6paqlvf3Xv/7/w/u+/8PAAAAAAAAAAAAAAAAAAD///8D////A////wMAAAAAAAAAAAAAAAAAACAAAAAJAAAACgAAAA0AAAALAAAADAAAAIUAAAAAIAAAASAAAAIgAAADIAAABCAAAAUgAAAGIAAACCAAAAkgAAAKIAAAKCAAACkgAABfIAAAADAAAAAAAAAAAAAAAAAAABkACwAZGRkAAAAABQAAAAAAAAkAAAAACwAAAAAAAAAAGQAKChkZGQMKBwABAAkLGAAACQYLAAALAAYZAAAAGRkZAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAABkACw0ZGRkADQAAAgAJDgAAAAkADgAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAATAAAAABMAAAAACQwAAAAAAAwAAAwAAAAAAAAAAAAAAAAAAAAA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/////////////////////////////////////wAAAAD+/wD8AQAA+AEAAHgAAAAA//vf+wAAgAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAD8/+Cv/////////////9///////yBAsAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAD8AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAADm/v///wBASQAAAAAAGAD//wDYAAAAAAAAAAEAPAAAAAAAAAAAAAAAABDgAR4AYP+/AAAAAAAA/wcAAAAAAAAAAAAAAAAAAAAAAAAA+M/jAAAAAwAg/38AAABOAAAAAAAAAAAAAAAAAAAIAAf8AAAAAAAAAAAAEAAgHgAwAAEAAAAAAAAAABAAIAAAAAD8bwAAAAAAAAAQACAAAAAAQAAAAAAAAAAAEAAgAAAAAAPgAAAAAAAAABAAIAAAAAD9AAAAAAAAAAAAACAAAAAA/wcQAAAAAAAAAAAgAAAAAID/EAAAAAAAABAAIAAAAAAAAAAAAAAAAAAYAKAAfwAA/wMAAAAAAAAAAAAEAAAAABAAAAAAAACAAIDA3wAMAAAAAAAAAAAAAAAEAB8AAAAAAAD+////APz//wAAAAAAAAAA/AAAAAAAAMD/3/8HAAAAAAAAAAAAAIAGAPwAAAAAAAAAAADAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAADg////HwAA/wMAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAABAAAYAAAAAAAAAAAAOAAAAAAQAAAAcAAAAAAAAAAAAAAAAAAAADAAAP5/LwAA/wP/fwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOMQAAAAAAAAAAAAAAAAAAAAAAAMT/////AAAAwAAAAAAAAAAAAQDgnwAAAAB/P/9/AAAAAAAAAAAAAAAAAAAQABAAAPz///8fAAAAAAAMAAAAAAAAQAAM8AAAAAAAAID4AAAAAAAAAMAAAAAAAAAAAP8A////IZADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////38A4PsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAD4ADgAOAAYID4/////P//////f9//8X//fwAA/////wAA/////wEAewPQwa9CAAwfvP//AAAAAAAO////////////////////////fwAAAP8HAAD/////////////PwAAAAAAAPz/////////////////////z////z//////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOCHA/4AAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAP//////f/////8AAAAAAAD////7/////////////w8A//////////////////////////////////8/AAAA/w8e////AfzB4AAAAAAAAAAAAAAAHgEAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAP//AAAAAP////8PAAAA////f/////////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////////wAAAAAAAAAAAAAAAAAAAAAAAP///////38AAAAAAADAAOAAAAAAAAAAAAAAAIAPcAAAAAAAAAAAAAAAAAAA/wD//38AAwAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAEAAAAAAD/8DAAAAAAAA8AAAAAAAAAAAABDAAAD//wMXAAAAAAD4AAAAAAiAAAAAAAAAAAAAAAgA/z8AwAAAAAAAAAAAAAAAAAAAAPAAAIADAAAAAAAAAIACAADAAABDAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAOAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAgAAAAAAAAAAAAAAAAAAAAD8/wMAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADD///8D////////9/9/DwAAAAAAAAAAAAAAAAAAAAAAgP7/APwBAAD4AQAA+D8AAAAAAAAAAAAAAAAAAAB/fwAwh///////j/8AAAAAAADg//9//w8BAAAAAAD//////z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////DwAAAAAPAAAAAAAAAAAAAAAAAACAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP8AAID/AAAAAID/AAAAAAAAAAAA+AAAwI8AAACAAAAAAAAAAAAAAAAAAAAAMP///P//////AAAAAAAAAIf/Af8BAAAA4AAAAOAAAAAAAAEAAGD4fwAAAAAAAAAA/gAAAP8AAAD/AAAAHgD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAA////fwAAAAAAAAAAAAAAAAAAAAAAAADgfwAAAMD//wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwD/8/z8AAIADAAAAAAAA/gMgAAAAAAAAAAAAAAAAGAAPAAAAAAA4AAAAAAAAAAAA4T8A6P7/HwAAAAAAAABgPwAAAAAAAAAAAAAAAAACAAAAAAAAAAYAAAAAAAAAAAAYACAAAMAfHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABE+ABoAAAAAAAAAAAAAAAATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAID///8AAAAAAAAAAAAAAACADgAAAP8fAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAIAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAPwHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAGID/AAAAAAAAAAAAAN8HAAAAAAAAAAAAAAAAAAAAAAAAgD4AAPz/HwMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////8DgAAAAAAAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAP//MAAA+AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwDwAAAAAAAAAAAAAA////////////////////////////////////////PwD/////f/7//////////////////////////////wEAAP//////////PwAAAAAAAAAAAAAAAAAAAAAAAAD//w8A/////////////38A////AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAIAAAACAAAIAAAACAAAIAAAACAAAAAAgAAAAIAAAgAAAAAAAAA//////////////////////8PAPj+/wAAAAAAAAAAAAAAAAAAAAB/AACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP9/AAAAAAAAAAAAAAAAAHAHAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v////////8fAAAAAAAAAAAA/v///////z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAP//////D////////////////w8A/3/+//7//v///z8A/x//////AAAA/AAAABwAAAD8////HwAAAAAAAMD///8HAP//////D/8BAwA/AAAAAAAAAAAAAAAAAAAAAAAAAP//////////////////////////////////PwD/H/8H//////////////////8PAP//////////////Af8PAAD/D/////////8A/wP//////wD///8/AAAAAAAAAAAAAP/v////////////////e/z/////58f////n/////////////////////w8A/z8PBwcAPwAAAAAAAAAAAAAAAAAQAAAAEQAAABIAAAATAAAAAAAAABYAAAAAAAAAFwAAAAAgAAAAAAAABQAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAABoAAABEOwAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAP//////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiDkAAAAAAAAAKhBzb3VyY2VNYXBwaW5nVVJMGHdlYi10cmVlLXNpdHRlci53YXNtLm1hcA==";var nA=typeof document<"u"?document.currentScript:null,HA=nA?.dataset.base??(nA?.src?new URL(".",nA.src).href:globalThis.location?.href??""),oA=null;function TA(){return oA??=AA.init({wasmBinary:Uint8Array.from(atob(bA),(A)=>A.charCodeAt(0)),locateFile:(A)=>A}).catch((A)=>{throw oA=null,A}),oA}var aA=(A)=>A.replace(/[&<>"]/g,(n)=>`&${{"&":"amp","<":"lt",">":"gt",'"':"quot"}[n]};`),xA=new Map;function vA(A){let n=xA.get(A);if(n===void 0){let I=A.split(".");n=I.map((e,C)=>`hl-${I.slice(0,C+1).join("-")}`).join(" "),xA.set(A,n)}return n}function tn(A){switch(A){case"comment":case"comment.documentation":return"c";case"punctuation.bracket":case"punctuation.special":case"punctuation.delimiter":return"p";case"string":case"string.special":case"string.special.path":case"string.special.symbol":case"character":case"string.regexp":return"s";case"string.escape":return"es";case"variable":case"variable.parameter":case"variable.builtin":case"variable.member":return"v";case"operator":case"tag.delimiter":return"o";case"function":case"function.builtin":case"function.call":case"function.method.call":case"function.method":case"function.macro":return"f";case"keyword":case"keyword.conditional":case"keyword.repeat":case"keyword.directive":case"keyword.modifier":case"keyword.return":case"keyword.operator":case"keyword.type":case"keyword.function":case"keyword.import":case"keyword.conditional.ternary":case"keyword.coroutine":case"keyword.exception":return"k";case"label":return"l";case"type":case"type.builtin":return"t";case"constant":case"constant.builtin":case"constant.macro":case"boolean":return"co";case"property":return"pr";case"number":return"n";case"attribute":case"tag.attribute":return"at";case"tag":return"tg";case"module":return"ns";case"constructor":return"cr"}}function Qn(A){A.sort((e,C)=>e.start-C.start||C.end-e.end);let n=[],I=[];for(let{start:e,end:C,name:t}of A){while(I.length&&I[I.length-1]<=e)I.pop();let B=I.length?I[I.length-1]:1/0,E=Math.min(C,B);if(E<=e)continue;n.push({start:e,end:E,name:t}),I.push(E)}return n}var jA=new Map,qA=4,rA=new Map;function Bn(A){if(!A)return null;if(rA.has(A))return rA.get(A);let n=v[A]?A:null,I=A.toLowerCase();for(let[e,C]of Object.entries(v)){if(n)break;if(C.injectionRegex&&new RegExp(C.injectionRegex).test(I))n=e}return n??=lA(I),rA.set(A,n),n}var En=(A)=>({startIndex:A.startIndex,endIndex:A.endIndex,startPosition:A.startPosition,endPosition:A.endPosition});function on(A,n){let I=En(A);if(n||A.childCount===0)return[I];let e=[],C=I;for(let t of A.children){if(t.startIndex>C.startIndex)e.push({startIndex:C.startIndex,startPosition:C.startPosition,endIndex:t.startIndex,endPosition:t.startPosition});C={startIndex:t.endIndex,startPosition:t.endPosition}}if(I.endIndex>C.startIndex)e.push({startIndex:C.startIndex,startPosition:C.startPosition,endIndex:I.endIndex,endPosition:I.endPosition});return e}function an(A,n){if(!n)return A;let[I,e,C,t]=n;if(I||C)return A;return{startIndex:A.startIndex+e,endIndex:A.endIndex+t,startPosition:{...A.startPosition,column:A.startPosition.column+e},endPosition:{...A.endPosition,column:A.endPosition.column+t}}}class PA{#A;#n=new Map;#I;constructor(A,n,I){this.name=A,this.title=I.title,this.scope=I.scope,this.fileTypes=I.fileTypes,this.language=n,this.#A=new AA,this.#A.setLanguage(n),this.#I=I}query(A){if(!this.#n.has(A)){let n=this.#I.queries[A];this.#n.set(A,n?new EA(this.language,n):null)}return this.#n.get(A)}parse(A,n,I){return this.#A.parse(A,n??null,I)}injections(A){let n=this.query("injections");if(!n)return[];let I=[],e=new Map;for(let C of n.matches(A.rootNode)){let t=C.setProperties??{},B=t["injection.language"],E=[];for(let{name:c,node:y}of C.captures)if(c==="injection.language")B=y.text;else if(c==="injection.content")E.push(y);let o=Bn(B);if(!o||!E.length)continue;let s=n.predicates[C.patternIndex]?.find((c)=>c.operator==="offset!"&&c.operands[0]?.name==="injection.content")?.operands.slice(1).map((c)=>Number(c.value)),d="injection.include-children"in t,l=E.flatMap((c)=>on(c,d)).map((c)=>an(c,s)).filter((c)=>c.endIndex>c.startIndex);if(!l.length)continue;if("injection.combined"in t){let c=`${C.patternIndex}:${o}`;if(e.has(c))e.get(c).ranges.push(...l);else{let y={language:o,ranges:l};e.set(c,y),I.push(y)}}else I.push({language:o,ranges:l})}for(let C of e.values())C.ranges.sort((t,B)=>t.startIndex-B.startIndex);return I}async loadInjections(A,n,I=0){if(I>=qA||!this.#I.queries.injections)return this;let e=!n;n??=this.parse(A);try{let C=this.injections(n),t=await Promise.all(C.map((B)=>IA(B.language).catch(()=>null)));for(let[B,E]of t.entries()){if(!E)continue;let o=E.parse(A,null,{includedRanges:C[B].ranges});try{await E.loadInjections(A,o,I+1)}finally{o.delete()}}}finally{if(e)n.delete()}return this}highlights(A,n){return Qn(this.#g(A,n,0))}#g(A,n,I){let e=this.query("highlights"),C=!n;n??=this.parse(A);try{let t=new Map;for(let{name:E,node:o,patternIndex:s}of e?.captures(n.rootNode)??[]){if(E.startsWith("_"))continue;let{startIndex:d,endIndex:l}=o;if(d===l)continue;let c=d*4294967296+l,y=t.get(c);if(!y||s>=y.patternIndex)t.set(c,{start:d,end:l,name:E,patternIndex:s})}let B=[...t.values()];if(I<qA)for(let{language:E,ranges:o}of this.injections(n)){let s=jA.get(E);if(!s)continue;let d=s.parse(A,null,{includedRanges:o});B=B.filter((l)=>!o.some((c)=>l.start>=c.startIndex&&l.end<=c.endIndex&&l.end-l.start<c.endIndex-c.startIndex));try{B.push(...s.#g(A,d,I+1))}finally{d.delete()}}return B}finally{if(C)n.delete()}}highlightHTML(A){let n="",I=0,e=[],C=(t)=>{while(e.length&&e[e.length-1]<=t){let B=e.pop();n+=aA(A.slice(I,B))+"</span>",I=B}};for(let{start:t,end:B,name:E}of this.highlights(A))C(t),n+=aA(A.slice(I,t))+`<span class="${vA(E)}">`,I=t,e.push(B);return C(1/0),n+aA(A.slice(I))}}var sA=new Map;function IA(A){let n=v[A];if(!n)return Promise.reject(Error(`forest: unknown language "${A}"`));let I=sA.get(A);if(!I)I=(async()=>{await TA();let e=await fetch(new URL(n.wasm,VA.baseURL).href);if(!e.ok)throw Error(`forest: ${n.wasm}: HTTP ${e.status}`);let C=await z.load(new Uint8Array(await e.arrayBuffer())),t=new PA(A,C,n);return jA.set(A,t),t})(),I.catch(()=>sA.delete(A)),sA.set(A,I);return I}function lA(A){let n=String(A).split(/[\\/]/).pop(),I=n.split(".").pop();for(let e of[n,I])for(let[C,t]of Object.entries(v))if(t.fileTypes.includes(e))return C;return null}function OA(A){for(let n=A;n&&n.nodeType===1;n=n.parentElement){let I=n.dataset.lang??/\blang(?:uage)?-(\S+)/.exec(n.className)?.[1];if(I)return v[I]?I:lA(I)}return null}async function XA(A,n){let I=n??OA(A);if(!I)throw Error("forest: cannot tell the element's language");let e=await IA(I),C=A.textContent;return await e.loadInjections(C),A.innerHTML=e.highlightHTML(C),A.classList.add("forest"),A.dataset.highlighted=I,A}async function cA(A="pre code, code[data-lang], pre[data-lang]"){let n=[...document.querySelectorAll(A)].filter((I)=>!I.dataset.highlighted&&OA(I));return Promise.all(n.map((I)=>XA(I)))}var VA={version:"0.2.0",get baseURL(){return HA},set baseURL(A){HA=new URL(A,globalThis.location?.href).href},languages:Object.keys(v),init:TA,load:IA,languageForFile:lA,async highlight(A,n){let I=await IA(A);return await I.loadInjections(n),I.highlightHTML(n)},highlightElement:XA,highlightAll:cA,captureClass:vA,tagForCapture:tn,Parser:AA,Language:z,Query:EA};globalThis.Forest=VA;if(nA?.hasAttribute("data-auto"))if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>cA());else cA();})();

//# debugId=BB3134F2D9F6A59A64756E2164756E21
//# sourceMappingURL=forest.js.map
