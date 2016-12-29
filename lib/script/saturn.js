let saturn = {};

saturn.graphId = console.graphId = 1;
saturn.graph = console.graph = (data)=> {
    let resp = JSON.stringify({id: (data.id ? data.id : 'chartjs-' + console.graphId), data: data});
    console.log('[chartjs] ' + resp);
    saturn.graphId++;
};

saturn.visId = console.visId = 1;
saturn.vis = console.vis = (visType, data, options)=> {
    let resp = JSON.stringify({id: (data.id ? data.id : 'vis-' + console.visId), type: visType, data: data, options: options});
    console.log('[visjs] ' + resp);
    saturn.visId++;
};

saturn.warning = console.warning = (err)=> {
    console.log('[SATURN] WARNING IN WORK');
    console.log(err);
};
