/**
 * WordPress dependencies
 */
import { Component, createRef, compose } from '@wordpress/element';
import { Popover, Button, IconButton, withSafeTimeout } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';

export class DotTip extends Component {
	constructor() {
		super( ...arguments );

		this.popoverRef = createRef();
	}

	componentDidMount() {
		const { isVisible, setTimeout } = this.props;

		if ( isVisible ) {
			// Force the popover to recalculate its position on the next frame. This
			// fixes the tip not appearing next to the inserter toggle on page load. This
			// happens because the popover calculates its position before <PostTitle> is
			// made visible, resulting in the position being too high on the page.
			setTimeout( () => {
				const popover = this.popoverRef.current;
				popover.refresh();
				popover.focus();
			}, 0 );
		}
	}

	render() {
		const { children, isVisible, hasNextTip, onDismiss, onDisable } = this.props;

		if ( ! isVisible ) {
			return null;
		}

		return (
			<Popover
				ref={ this.popoverRef }
				className="nux-dot-tip"
				position="middle right"
				noArrow
				focusOnMount="container"
				role="dialog"
				aria-label={ __( 'Gutenberg tips' ) }
				onClose={ onDismiss }
				onClick={ ( event ) => event.stopPropagation() }
			>
				<p>{ children }</p>
				<p>
					<Button isLink onClick={ onDismiss }>
						{ hasNextTip ? __( 'See next tip' ) : __( 'Got it' ) }
					</Button>
				</p>
				<IconButton
					className="nux-dot-tip__disable"
					icon="no-alt"
					label={ __( 'Disable tips' ) }
					onClick={ onDisable }
				/>
			</Popover>
		);
	}
}

export default compose(
	withSafeTimeout,
	withSelect( ( select, { id } ) => {
		const { isTipVisible, getAssociatedGuide } = select( 'core/nux' );
		const associatedGuide = getAssociatedGuide( id );
		return {
			isVisible: isTipVisible( id ),
			hasNextTip: !! ( associatedGuide && associatedGuide.nextTipId ),
		};
	} ),
	withDispatch( ( dispatch, { id } ) => {
		const { dismissTip, disableTips } = dispatch( 'core/nux' );
		return {
			onDismiss() {
				dismissTip( id );
			},
			onDisable() {
				disableTips();
			},
		};
	} ),
)( DotTip );
