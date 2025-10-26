import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface InviteCardProps {
    inviteId: string;
    groupName: string;
    onAccept: (inviteId: string) => void;
    onDecline: (inviteId: string) => void;
}

const InviteCard: React.FC<InviteCardProps> = ({ 
    inviteId,
    groupName,
    onAccept,
    onDecline
}) => {
    return (
        <Card className="bg-clash-dark border-clash-gold mb-4">
            <CardHeader>
                <CardTitle className="text-clash-gold text-lg">{groupName}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-clash-white text-sm">You have been invited to join this group</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button
                    onClick={() => onDecline(inviteId)}
                    variant="outline"
                    className="border-clash-blue hover:bg-clash-blue/20"
                >
                    Decline
                </Button>
                <Button
                    onClick={() => onAccept(inviteId)}
                    className="bg-clash-blue hover:bg-clash-blue/80 text-white"
                >
                    Accept
                </Button>
            </CardFooter>
        </Card>
    );
};

export default InviteCard;