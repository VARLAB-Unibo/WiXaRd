import { Plane } from 'three';
import { Vector3 } from 'three';

import FontLibrary from './FontLibrary.js';
import UpdateManager from './UpdateManager.js';

import DEFAULTS from '../../utils/Defaults.js';
import { warnAboutDeprecatedAlignItems } from '../../utils/block-layout/AlignItems';

/**

Job:
- Set this component attributes and call updates accordingly
- Getting this component attribute, from itself or from its parents
- Managing this component's states

This is the core module of three-mesh-ui. Every component is composed with it.
It owns the principal public methods of a component : set, setupState and setState.

 */
export default function MeshUIComponent( Base ) {

	return class MeshUIComponent extends Base {

		constructor( options ) {

			super( options );

			this.states = {};
			this.currentState = undefined;
			this.isUI = true;
			this.autoLayout = true;

			// children
			this.childrenUIs = [];
			this.childrenBoxes = [];
			this.childrenTexts = [];
			this.childrenInlines = [];

			// parents
			this.parentUI = null;
			// update parentUI when this component will be added or removed
			this.addEventListener( 'added', this._rebuildParentUI );
			this.addEventListener( 'removed', this._rebuildParentUI );
		}

		/////////////
		/// GETTERS
		/////////////

		getClippingPlanes() {

			const planes = [];

			if ( this.parentUI ) {

				if ( this.isBlock && this.parentUI.getHiddenOverflow() ) {

					const yLimit = ( this.parentUI.getHeight() / 2 ) - ( this.parentUI.padding || 0 );
					const xLimit = ( this.parentUI.getWidth() / 2 ) - ( this.parentUI.padding || 0 );

					const newPlanes = [
						new Plane( new Vector3( 0, 1, 0 ), yLimit ),
						new Plane( new Vector3( 0, -1, 0 ), yLimit ),
						new Plane( new Vector3( 1, 0, 0 ), xLimit ),
						new Plane( new Vector3( -1, 0, 0 ), xLimit )
					];

					newPlanes.forEach( plane => {

						plane.applyMatrix4( this.parent.matrixWorld );

					} );

					planes.push( ...newPlanes );

				}

				if ( this.parentUI.parentUI ) {

					planes.push( ...this.parentUI.getClippingPlanes() );

				}

			}

			return planes;

		}

		/** Get the highest parent of this component (the parent that has no parent on top of it) */
		getHighestParent() {

			if ( !this.parentUI ) {

				return this;

			}

			return this.parent.getHighestParent();


		}

		/**
		 * look for a property in this object, and if does not find it, find in parents or return default value
		 * @private
		 */
		_getProperty( propName ) {

			if ( this[ propName ] === undefined && this.parentUI ) {

				return this.parent._getProperty( propName );

			} else if ( this[ propName ] !== undefined ) {

				return this[ propName ];

			}

			return DEFAULTS[ propName ];

		}

		//

		getFontSize() {

			return this._getProperty( 'fontSize' );

		}

		getFontKerning() {

			return this._getProperty( 'fontKerning' );

		}

		getLetterSpacing() {

			return this._getProperty( 'letterSpacing' );

		}

		getFontTexture() {

			if ( this[ 'fontTexture' ] === undefined && this.parentUI ) {

				return this.parent._getProperty( 'fontTexture' );

			} else if ( this[ 'fontTexture' ] !== undefined ) {

				return this[ 'fontTexture' ];

			}

			return DEFAULTS.getDefaultTexture();

		}

		getFontFamily() {

			return this._getProperty( 'fontFamily' );

		}

		getBreakOn() {

			return this._getProperty( 'breakOn' );

		}

		getWhiteSpace() {

			return this._getProperty( 'whiteSpace' );

		}

		getTextAlign() {

			return this._getProperty( 'textAlign' );

		}

		getTextType() {

			return this._getProperty( 'textType' );

		}

		getFontColor() {

			return this._getProperty( 'fontColor' );

		}


		getFontSupersampling() {

			return this._getProperty( 'fontSupersampling' );

		}

		getFontOpacity() {

			return this._getProperty( 'fontOpacity' );

		}

		getFontPXRange() {

			return this._getProperty( 'fontPXRange' );

		}

		getBorderRadius() {

			return this._getProperty( 'borderRadius' );

		}

		getBorderWidth() {

			return this._getProperty( 'borderWidth' );

		}

		getBorderColor() {

			return this._getProperty( 'borderColor' );

		}

		getBorderOpacity() {

			return this._getProperty( 'borderOpacity' );

		}

		/// SPECIALS

		/** return the first parent with a 'threeOBJ' property */
		getContainer() {

			if ( !this.threeOBJ && this.parent ) {

				return this.parent.getContainer();

			} else if ( this.threeOBJ ) {

				return this;

			}

			return DEFAULTS.container;


		}

		/** Get the number of UI parents above this elements (0 if no parent) */
		getParentsNumber( i ) {

			i = i || 0;

			if ( this.parentUI ) {

				return this.parentUI.getParentsNumber( i + 1 );

			}

			return i;

		}

		////////////////////////////////////
		/// GETTERS WITH NO PARENTS LOOKUP
		////////////////////////////////////

		getBackgroundOpacity() {

			return ( !this.backgroundOpacity && this.backgroundOpacity !== 0 ) ?
				DEFAULTS.backgroundOpacity : this.backgroundOpacity;

		}

		getBackgroundColor() {

			return this.backgroundColor || DEFAULTS.backgroundColor;

		}

		getBackgroundTexture() {

			return this.backgroundTexture || DEFAULTS.getDefaultTexture();

		}

		/**
		 * @deprecated
		 * @returns {string}
		 */
		getAlignContent() {

			return this.alignContent || DEFAULTS.alignContent;

		}

		getAlignItems() {

			return this.alignItems || DEFAULTS.alignItems;

		}

		getContentDirection() {

			return this.contentDirection || DEFAULTS.contentDirection;

		}

		getJustifyContent() {

			return this.justifyContent || DEFAULTS.justifyContent;

		}

		getInterLine() {

			return ( this.interLine === undefined ) ? DEFAULTS.interLine : this.interLine;

		}

		getOffset() {

			return ( this.offset === undefined ) ? DEFAULTS.offset : this.offset;

		}

		getBackgroundSize() {

			return ( this.backgroundSize === undefined ) ? DEFAULTS.backgroundSize : this.backgroundSize;

		}

		getHiddenOverflow() {

			return ( this.hiddenOverflow === undefined ) ? DEFAULTS.hiddenOverflow : this.hiddenOverflow;

		}

		getBestFit() {

			return ( this.bestFit === undefined ) ? DEFAULTS.bestFit : this.bestFit;

		}

		///////////////
		///  UPDATE
		///////////////

		/**
		 * Filters children in order to compute only one times children lists
		 * @private
		 */
		_rebuildChildrenLists() {

			// Stores all children that are ui
			this.childrenUIs = this.children.filter( child => child.isUI );

			// Stores all children that are box
			this.childrenBoxes = this.children.filter( child => child.isBoxComponent );

			// Stores all children that are inline
			this.childrenInlines = this.children.filter( child => child.isInline );

			// Stores all children that are text
			this.childrenTexts = this.children.filter( child => child.isText );
		}

		/**
		 * Try to retrieve parentUI after each structural change
		 * @private
		 */
		_rebuildParentUI = ( ) => {

			if ( this.parent && this.parent.isUI ) {

				this.parentUI = this.parent;

			} else {

				this.parentUI = null;

			}

		};

		/**
		 * When the user calls component.add, it registers for updates,
		 * then call THREE.Object3D.add.
		 */
		add() {

			for ( const id of Object.keys( arguments ) ) {

				// An inline component relies on its parent for positioning
				if ( arguments[ id ].isInline ) this.update( null, true );

			}

			const result = super.add( ...arguments );

			this._rebuildChildrenLists();

			return result;

		}

		/**
		 * When the user calls component.remove, it registers for updates,
		 * then call THREE.Object3D.remove.
		 */
		remove() {

			for ( const id of Object.keys( arguments ) ) {

				// An inline component relies on its parent for positioning
				if ( arguments[ id ].isInline ) this.update( null, true );

			}

			const result = super.remove( ...arguments );

			this._rebuildChildrenLists();

			return result;

		}

		//

		update( updateParsing, updateLayout, updateInner ) {

			UpdateManager.requestUpdate( this, updateParsing, updateLayout, updateInner );

		}

		onAfterUpdate() {

		}

		/**
		 * Called by FontLibrary when the font requested for the current component is ready.
		 * Trigger an update for the component whose font is now available.
		 * @private - "package protected"
		 */
		_updateFontFamily( font ) {

			this.fontFamily = font;

			this.traverse( ( child ) => {

				if ( child.isUI ) child.update( true, true, false );

			} );

			this.getHighestParent().update( false, true, false );

		}

		/** @private - "package protected" */
		_updateFontTexture( texture ) {

			this.fontTexture = texture;

			this.getHighestParent().update( false, true, false );

		}

		/**
		 * Set this component's passed parameters.
		 * If necessary, take special actions.
		 * Update this component unless otherwise specified.
		 */
		set( options ) {

			let parsingNeedsUpdate, layoutNeedsUpdate, innerNeedsUpdate;

			// Register to the update manager, so that it knows when to update

			UpdateManager.register( this );

			// Abort if no option passed

			if ( !options || JSON.stringify( options ) === JSON.stringify( {} ) ) return;

			// DEPRECATION Warnings until -------------------------------------- 7.x.x ---------------------------------------

			// Align content has been removed
			if( options["alignContent"] ){

				options["alignItems"] = options["alignContent"];

				if( !options["textAlign"] ){

					options["textAlign"] = options["alignContent"];

				}

				console.warn("`alignContent` property has been deprecated, please rely on `alignItems` and `textAlign` instead.")

				delete options["alignContent"];

			}

			// Align items left top bottom right will be removed
			if( options['alignItems'] ){

				warnAboutDeprecatedAlignItems( options['alignItems'] );

			}


			// Set this component parameters according to options, and trigger updates accordingly
			// The benefit of having two types of updates, is to put everthing that takes time
			// in one batch, and the rest in the other. This way, efficient animation is possible with
			// attribute from the light batch.

			for ( const prop of Object.keys( options ) ) {

				if ( this[ prop ] != options[ prop ] ) {

					switch ( prop ) {

						case 'content' :
						case 'fontSize' :
						case 'fontKerning' :
						case 'breakOn':
						case 'whiteSpace':
							if ( this.isText ) parsingNeedsUpdate = true;
							layoutNeedsUpdate = true;
							this[ prop ] = options[ prop ];
							break;

						case 'bestFit' :
							if ( this.isBlock ) {
								parsingNeedsUpdate = true;
								layoutNeedsUpdate = true;
							}
							this[ prop ] = options[ prop ];
							break;

						case 'width' :
						case 'height' :
						case 'padding' :
							if ( this.isInlineBlock || ( this.isBlock && this.getBestFit() != 'none' ) ) parsingNeedsUpdate = true;
							layoutNeedsUpdate = true;
							this[ prop ] = options[ prop ];
							break;

						case 'letterSpacing' :
						case 'interLine' :
							if ( this.isBlock && this.getBestFit() != 'none' ) parsingNeedsUpdate = true;
							layoutNeedsUpdate = true;
							this[ prop ] = options[ prop ];
							break;

						case 'margin' :
						case 'contentDirection' :
						case 'justifyContent' :
						case 'alignContent' :
						case 'alignItems' :
						case 'textAlign' :
						case 'textType' :
							layoutNeedsUpdate = true;
							this[ prop ] = options[ prop ];
							break;

						case 'fontColor' :
						case 'fontOpacity' :
						case 'fontSupersampling' :
						case 'offset' :
						case 'backgroundColor' :
						case 'backgroundOpacity' :
						case 'backgroundTexture' :
						case 'backgroundSize' :
						case 'borderRadius' :
						case 'borderWidth' :
						case 'borderColor' :
						case 'borderOpacity' :
							innerNeedsUpdate = true;
							this[ prop ] = options[ prop ];
							break;

						case 'hiddenOverflow' :
							this[ prop ] = options[ prop ];
							break;

					}

				}

			}

			// special cases, this.update() must be called only when some files finished loading

			if ( options.fontFamily ) {

				FontLibrary.setFontFamily( this, options.fontFamily );

			}

			if ( options.fontTexture ) {

				FontLibrary.setFontTexture( this, options.fontTexture );

			}

			// if font kerning changes for a child of a block with Best Fit enabled, we need to trigger parsing for the parent as well.
			if ( this.parentUI && this.parentUI.getBestFit() != 'none' ) this.parentUI.update( true, true, false );

			// Call component update

			this.update( parsingNeedsUpdate, layoutNeedsUpdate, innerNeedsUpdate );


			if ( layoutNeedsUpdate ) this.getHighestParent().update( false, true, false );

		}

		/////////////////////
		// STATES MANAGEMENT
		/////////////////////

		/** Store a new state in this component, with linked attributes */
		setupState( options ) {

			this.states[ options.state ] = {
				attributes: options.attributes,
				onSet: options.onSet
			};

		}

		/** Set the attributes of a stored state of this component */
		setState( state ) {

			const savedState = this.states[ state ];

			if ( !savedState ) {
				console.warn( `state "${state}" does not exist within this component:`, this.name );
				return;
			}

			if ( state === this.currentState ) return;

			this.currentState = state;

			if ( savedState.onSet ) savedState.onSet();

			if ( savedState.attributes ) this.set( savedState.attributes );

		}

		/** Get completely rid of this component and its children, also unregister it for updates */
		clear() {

			this.traverse( ( obj ) => {

				UpdateManager.disposeOf( obj );

				if ( obj.material ) obj.material.dispose();

				if ( obj.geometry ) obj.geometry.dispose();

			} );

		}
	};

}
