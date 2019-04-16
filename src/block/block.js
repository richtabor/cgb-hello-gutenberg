/**
 * BLOCK: cgb-hello-gutenberg
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

// External dependency.
import noop from 'lodash/noop';
import classnames from 'classnames';

//  Import CSS.
import './style.scss';
import './editor.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const { Fragment } = wp.element;
const { RichText, MediaUpload, mediaUpload, MediaUploadCheck, InspectorControls, PanelColorSettings, withColors, getColorClassName, AlignmentToolbar, BlockControls } = wp.editor;
const { Button, Dashicon, DropZone, PanelBody, ToggleControl } = wp.components;

/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'cgb/block-cgb-hello-gutenberg', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Block Party' ), // Block title.
	icon: 'shield', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'common', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'Ba' ),
		__( 'CGB Example' ),
		__( 'create-guten-block' ),
	],
	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'p',
		},
		imgId: {
			type: 'number',
		},
		imgUrl: {
			type: 'string',
			source: 'attribute',
			attribute: 'src',
			selector: 'img, video',
		},
		mediaType: {
			type: 'string',
		},
		backgroundColor: {
			type: 'string',
		},
		customBackgroundColor: {
			type: 'string',
		},
		extras: {
			type: 'boolean',
			default: true,
		},
		contentAlign: {
			type: 'string',
		},
	},
	styles: [
		{ name: 'no-border', label: __( 'No Border' ) },
	],

	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	edit: withColors( 'backgroundColor' )( function( props ) {

		const {
			isSelected,
			setAttributes,
			className,
			attributes,
			backgroundColor,
			setBackgroundColor,
		} = props;

		const {
			imgId,
			imgUrl,
			content,
			mediaType,
			extras,
			contentAlign,
		} = attributes;

		const classes = classnames( className, {
			[ backgroundColor.class ]: backgroundColor.class,
			[ `has-${ contentAlign }-content` ]: contentAlign,
		} );

		const styles = { backgroundColor: backgroundColor.color, textAlign: contentAlign };

		function onUploadImage( media ) {

			let mediaType;

			// for media selections originated from a file upload.
			if ( media.media_type ) {
				if ( media.media_type === 'image' ) {
					mediaType = 'image';
				} else {
					// only images and videos are accepted so if the media_type is not an image we can assume it is a video.
					// video contain the media type of 'file' in the object returned from the rest api.
					mediaType = 'video';
				}
			} else {
				// for media selections originated from existing files in the media library.
				mediaType = media.type;
			}

			setAttributes( { imgUrl: media.url, imgId: media.id, mediaType } )
		}

		function getMedia( mediaType ) {

			if ( mediaType === 'image' ) {
				return <img src={ imgUrl } />
			} else {
				// only images and videos are accepted so if the media_type is not an image we can assume it is a video.
				// video contain the media type of 'file' in the object returned from the rest api.
				return <video controls src={ imgUrl } />
			}
		}

		return (
			<div className={ classes } style={ styles }>
				{ isSelected && (
					<Fragment>
						<InspectorControls>
							<PanelBody
								title={ __( 'Party Settings' ) }
								initialOpen={ false }
							>
								<ToggleControl
									label={ __( 'View Extras' ) }
									checked={ !! extras }
									onChange={ () => setAttributes( {  extras: ! extras } ) }
									help={ !! extras ? __( 'Showing the extras.' ) : __( 'Toggle to show the extras.' ) }
								/>
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Color Settings' ) }
								initialOpen={ false }
								colorSettings={ [
									{
										value: backgroundColor.color,
										onChange: setBackgroundColor,
										label: __( 'Background Color' ),
									},
								] }
							>
							</PanelColorSettings>
						</InspectorControls>
						<BlockControls>
							<AlignmentToolbar
								value={ contentAlign }
								onChange={ ( nextContentAlign ) => setAttributes( { contentAlign: nextContentAlign } ) }
							/>
						</BlockControls>
					</Fragment>
				) }
				<MediaUploadCheck>
					<MediaUpload
						onSelect={ onUploadImage }
						allowedTypes={ [ 'image', 'video' ] }
						value={ imgUrl }
						render={ ( { open } ) => (
							<Button onClick={ open }>
								{ ! imgUrl ? <Dashicon icon="format-image" /> : getMedia( mediaType ) }
							</Button>
						) }
					/>
				</MediaUploadCheck>
				<RichText
					tagName="p"
					className={ className }
					onChange={ ( content ) => setAttributes( { content } ) }
					value={ content }
				/>

				{ extras &&
					<div>
						<p>— Hello from the bssackend.</p>
						<p>
							CGB BLOCK: <code>cgb-hello-gutenberg</code> is a new Gutenberg block
						</p>
					</div>
				}
			</div>
		);
	},
	),

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function( props ) {

		// Media.
		const mediaTypeRenders = {
			image: () => <img src={ props.attributes.imgUrl } />,
			video: () => <video controls src={ props.attributes.imgUrl } />,
		};

		// Background color class and styles.
		const backgroundClass = getColorClassName( 'background-color', props.attributes.backgroundColor );

		const classes = classnames( {
			'has-background': props.attributes.backgroundColor || props.attributes.customBackgroundColor,
			[ backgroundClass ]: backgroundClass,
			[ `has-${ props.attributes.contentAlign }-content` ]: props.attributes.contentAlign,
		} );

		const styles = {
			backgroundColor: backgroundClass ? undefined : props.attributes.customBackgroundColor,
			textAlign: props.attributes.contentAlign,
		};

		return (
			<div className={ classes } style={ styles }>
				{ ( mediaTypeRenders[ props.attributes.mediaType ] || noop )() }
				<RichText.Content tagName="p" value={ props.attributes.content } />
				{ props.attributes.extras && (
					<div>
						<p>
							CGB BLOCK: <code>cgb-hello-gutenberg</code> is a new Gutenberg block.
						</p>
						<p>
							It was created via{ ' ' }
							<code>
								<a href="https://github.com/ahmadawais/create-guten-block">
									create-guten-block
								</a>
							</code>.
						</p>
					</div>
				) }
			</div>
		);
	},
} );
