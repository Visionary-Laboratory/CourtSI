class BeforeAfter {
    constructor(enteryObject) {
        const beforeAfterContainer = document.querySelector(enteryObject.id);
        if (!beforeAfterContainer) return;

        const before = beforeAfterContainer.querySelector('.bal-before');
        const beforeText = beforeAfterContainer.querySelector('.bal-beforePosition');
        const afterText = beforeAfterContainer.querySelector('.bal-afterPosition');
        const handle = beforeAfterContainer.querySelector('.bal-handle');

        if (!before || !handle) return;

        const afterImg = beforeAfterContainer.querySelector('.bal-after img');
        const beforeImg = beforeAfterContainer.querySelector('.bal-before img');

        const updateSizes = () => {
            const inset = beforeAfterContainer.querySelector('.bal-before-inset');
            const containerWidth = beforeAfterContainer.offsetWidth;
            const ratios = [];
            if (afterImg && afterImg.naturalWidth && afterImg.naturalHeight) {
                ratios.push(afterImg.naturalHeight / afterImg.naturalWidth);
            }
            if (beforeImg && beforeImg.naturalWidth && beforeImg.naturalHeight) {
                ratios.push(beforeImg.naturalHeight / beforeImg.naturalWidth);
            }
            if (ratios.length) {
                const maxRatio = Math.max(...ratios);
                const height = containerWidth * maxRatio;
                beforeAfterContainer.style.height = `${height}px`;
            }
            if (inset) {
                inset.style.width = `${containerWidth}px`;
                inset.style.height = `${beforeAfterContainer.offsetHeight}px`;
            }
        };

        const onImageLoad = () => updateSizes();
        if (afterImg) {
            if (afterImg.complete) {
                onImageLoad();
            } else {
                afterImg.addEventListener('load', onImageLoad, { once: true });
            }
        }
        if (beforeImg && !beforeImg.complete) {
            beforeImg.addEventListener('load', onImageLoad, { once: true });
        }

        window.addEventListener('resize', updateSizes);

        before.style.width = '50%';
        handle.style.left = '50%';

        let isTouching = false;

        beforeAfterContainer.addEventListener('touchstart', (e) => {
            isTouching = true;
            const containerWidth = beforeAfterContainer.offsetWidth;
            const currentPoint = e.changedTouches[0].clientX;
            const startOfDiv = beforeAfterContainer.getBoundingClientRect().left;
            const modifiedCurrentPoint = currentPoint - startOfDiv;

            if (modifiedCurrentPoint > 10 && modifiedCurrentPoint < containerWidth - 10) {
                const newWidth = (modifiedCurrentPoint * 100) / containerWidth;
                before.style.width = `${newWidth}%`;
                if (afterText) afterText.style.zIndex = '1';
                handle.style.left = `${newWidth}%`;
            }
        }, { passive: true });

        beforeAfterContainer.addEventListener('touchmove', (e2) => {
            if (!isTouching) return;
            const containerWidth = beforeAfterContainer.offsetWidth;
            const currentPoint = e2.changedTouches[0].clientX;
            const startOfDiv = beforeAfterContainer.getBoundingClientRect().left;
            const modifiedCurrentPoint = currentPoint - startOfDiv;

            if (modifiedCurrentPoint > 10 && modifiedCurrentPoint < containerWidth - 10) {
                const newWidth = (modifiedCurrentPoint * 100) / containerWidth;
                before.style.width = `${newWidth}%`;
                if (afterText) afterText.style.zIndex = '1';
                handle.style.left = `${newWidth}%`;
            }
        }, { passive: true });

        beforeAfterContainer.addEventListener('touchend', () => {
            isTouching = false;
        }, { passive: true });

        beforeAfterContainer.addEventListener('mousemove', (e) => {
            const containerWidth = beforeAfterContainer.offsetWidth;
            const newWidth = (e.offsetX * 100) / containerWidth;

            if (e.offsetX > 10 && e.offsetX < containerWidth - 10) {
                before.style.width = `${newWidth}%`;
                if (afterText) afterText.style.zIndex = '1';
                handle.style.left = `${newWidth}%`;
            }
        });
    }
}
