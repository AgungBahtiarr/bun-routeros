const { RosQuery, rosQuery } = require('../src/query');
const { expect } = require('chai');

describe('RosQuery', () => {
    it('should build a simple command without params', () => {
        const query = rosQuery('/ip/address/print').build();
        expect(query).to.deep.equal(['/ip/address/print']);
    });

    it('should build assignment properties', () => {
        const query = rosQuery('/ip/address/add')
            .prop('interface', 'ether1')
            .prop('address', '192.168.88.1/24')
            .build();

        expect(query).to.deep.equal([
            '/ip/address/add',
            '=interface=ether1',
            '=address=192.168.88.1/24',
        ]);
    });

    it('should build multiple props from an object', () => {
        const query = rosQuery('/ip/address/add')
            .props({
                interface: 'ether2',
                address: '10.0.0.1/24',
                comment: 'gateway',
            })
            .build();

        expect(query).to.deep.equal([
            '/ip/address/add',
            '=interface=ether2',
            '=address=10.0.0.1/24',
            '=comment=gateway',
        ]);
    });

    it('should build filter queries with where, whereNot, and operators', () => {
        const query = rosQuery('/interface/print')
            .where('type', 'ether')
            .whereNot('disabled', 'yes')
            .and()
            .proplist('name', 'mac-address', 'running')
            .build();

        expect(query).to.deep.equal([
            '/interface/print',
            '?type=ether',
            '?disabled=yes',
            '?#!',
            '?#&',
            '=.proplist=name,mac-address,running',
        ]);
    });

    it('should build comparisons (whereLess, whereGreater, whereExists, whereMissing, or, not)', () => {
        const query = RosQuery.cmd('/queue/simple/print')
            .whereGreater('max-limit', 1000)
            .whereLess('priority', 8)
            .or()
            .whereExists('comment')
            .whereMissing('disabled')
            .not()
            .build();

        expect(query).to.deep.equal([
            '/queue/simple/print',
            '?>max-limit=1000',
            '?<priority=8',
            '?#|',
            '?+comment',
            '?-disabled',
            '?#!',
        ]);
    });
});
