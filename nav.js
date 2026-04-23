(function () {
    const dropdowns = document.querySelectorAll('.dropdown-wrapper, .tools-dropdown-wrapper');

    dropdowns.forEach(wrapper => {
        const trigger = wrapper.querySelector('[data-trigger="dropdown"]');
        const panel = wrapper.querySelector('.dropdown-panel, .tools-dropdown-menu');

        if (!trigger || !panel) return;

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();

            // close others
            document.querySelectorAll('.dropdown-panel.active, .tools-dropdown-menu.active')
                .forEach(p => {
                    if (p !== panel) p.classList.remove('active');
                });

            panel.classList.toggle('active');
            wrapper.classList.toggle('active-dropdown');
        });
    });

    // click outside → close all
    document.addEventListener('click', function () {
        document.querySelectorAll('.dropdown-panel, .tools-dropdown-menu')
            .forEach(p => p.classList.remove('active'));

        document.querySelectorAll('.dropdown-wrapper, .tools-dropdown-wrapper')
            .forEach(w => w.classList.remove('active-dropdown'));
    });
})();